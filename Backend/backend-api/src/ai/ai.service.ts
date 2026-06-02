import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DoctorsService } from '../doctors/doctors.service';
import { HospitalsService } from '../hospitals/hospitals.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { ServicePackagesService } from '../service-packages/service-packages.service';

@Injectable()
export class AiService {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly hospitalsService: HospitalsService,
    private readonly appointmentsService: AppointmentsService,
    private readonly servicePackagesService: ServicePackagesService,
  ) { }

  private currentKeyIndex = 0;

  private getGroqApiKeys(): string[] {
    const keys: string[] = [];
    if (process.env.GROQ_API_KEY) keys.push(process.env.GROQ_API_KEY);
    if (process.env.GROQ_API_KEY_2) keys.push(process.env.GROQ_API_KEY_2);
    if (process.env.GROQ_API_KEY_3) keys.push(process.env.GROQ_API_KEY_3);
    if (process.env.GROQ_API_KEYS) {
      keys.push(...process.env.GROQ_API_KEYS.split(',').map(k => k.trim()));
    }
    return [...new Set(keys)].filter(k => k);
  }

  private getGroqApiKey(): string {
    const keys = this.getGroqApiKeys();
    if (keys.length === 0) {
      throw new InternalServerErrorException('GROQ_API_KEY is not configured');
    }
    return keys[this.currentKeyIndex % keys.length];
  }

  private switchGroqApiKey() {
    this.currentKeyIndex++;
    const keys = this.getGroqApiKeys();
    console.log(`[AI SERVICE] Rate limit hit. Switched to next Groq API Key (Index: ${this.currentKeyIndex % keys.length} / Total: ${keys.length})`);
  }

  async processChat(messages: any[], bookingData: any): Promise<any> {
    try {
      const systemPrompt = `
Vai trò: Trợ lý y tế STL Clinic. Đặt lịch khám bệnh. Không tự đoán bịa dữ liệu.
Mục tiêu thu thập: Triệu chứng/Khoa hoặc Gói khám, Khu vực mới tới Bệnh viện, Bác sĩ, Ngày, Giờ.
- Fast-track: Gọi ngay các tool (có thể liên tiếp/song song) nếu có sẵn data. KHÔNG hỏi vòng vo.
- Giờ khám: BẮT BUỘC dùng tool lấy giờ trống. Nếu user chưa chọn hoặc giờ không khớp, HÃY liệt kê và YÊU CẦU user chọn cụ thể 1 giờ.
- Tự gợi ý bác sĩ nếu user không chọn. 
- BƯỚC CUỐI CÙNG: CHỈ KHI đã chốt ĐÚNG 1 giờ khám cụ thể và đủ TẤT CẢ thông tin, TÓM TẮT lại và HỎI người dùng đồng ý đặt lịch này không.
- TUYỆT ĐỐI KHÔNG tự động chốt nếu người dùng chưa trả lời đồng ý/xác nhận.
- Reset data nếu user đổi ý. Dịch tiếng lóng sang y khoa. KHÔNG kê đơn thuốc.

Status: ${JSON.stringify(bookingData)}
Date: ${new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)}
`;

      const apiMessages = [{ role: 'system', content: systemPrompt }, ...messages.slice(-7)];

      const tools = [
        {
          type: "function",
          function: {
            name: "get_hospitals",
            description: "Lấy danh sách các bệnh viện trong hệ thống. Dùng khi người dùng muốn biết có những bệnh viện nào.",
            parameters: {
              type: "object",
              properties: {
                city: { type: "string", description: "Tên thành phố (ví dụ: Hồ Chí Minh, Hà Nội, Đà Nẵng)" }
              }
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_doctors",
            description: "Lấy danh sách bác sĩ. Dùng khi cần gợi ý bác sĩ cho người dùng.",
            parameters: {
              type: "object",
              properties: {
                hospitalId: { type: ["number", "null"], description: "ID của bệnh viện nếu người dùng đã chọn bệnh viện" },
                specialty: { type: ["string", "null"], description: "Tên chuyên khoa (ví dụ: Nội khoa, Tim mạch...)" }
              }
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_service_packages",
            description: "Lấy danh sách các gói dịch vụ khám (ví dụ: tầm soát ung thư, khám tổng quát...). Dùng khi người dùng muốn tìm hoặc đặt gói khám.",
            parameters: {
              type: "object",
              properties: {
                keyword: { type: ["string", "null"], description: "Từ khóa tìm kiếm gói khám (ví dụ: tầm soát ung thư)" }
              }
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_available_slots",
            description: "Lấy danh sách các khung giờ trống của một bác sĩ vào một ngày cụ thể.",
            parameters: {
              type: "object",
              properties: {
                doctorId: { type: "number", description: "ID của bác sĩ" },
                date: { type: "string", description: "Ngày cần xem lịch (định dạng YYYY-MM-DD)" }
              },
              required: ["doctorId", "date"]
            }
          }
        }
      ];

      return await this.callGroqWithTools(apiMessages, tools);
    } catch (error) {
      console.error('AI process error:', error);
      throw new InternalServerErrorException('Failed to process AI chat');
    }
  }

  private async callGroqWithTools(apiMessages: any[], tools?: any[], depth: number = 0, retryCount: number = 0): Promise<any> {
    if (depth > 7) {
      throw new Error("Quá nhiều lần gọi tool liên tiếp.");
    }

    const groqApiKey = this.getGroqApiKey();

    // Groq (Llama 3.3) hoàn toàn hỗ trợ dùng tools và json_object cùng lúc.
    // Việc này đảm bảo Model có thể gọi Tool NHIỀU LẦN liên tiếp, 
    // và khi quyết định trả lời (không gọi tool nữa) thì bắt buộc format JSON.
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        ...(tools && tools.length > 0 ? { tools, parallel_tool_calls: false } : { response_format: { type: 'json_object' } }),
        temperature: Math.min(0.2 + (depth * 0.2), 1.0),
      }),
    });

    if (response.status === 429) {
      if (retryCount >= 5) throw new InternalServerErrorException('Groq Rate Limit Exceeded after retries');
      
      const keysCount = this.getGroqApiKeys().length;
      if (keysCount > 1) {
        this.switchGroqApiKey();
        // Wait briefly before retrying with new key
        await new Promise(r => setTimeout(r, 1000));
      } else {
        console.warn("Groq API Rate Limit (429) in tool phase. Retrying in 5s...");
        await new Promise(r => setTimeout(r, 5000));
      }
      return await this.callGroqWithTools(apiMessages, tools, depth, retryCount + 1);
    }

    let responseMessage: any = null;

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);

      let recovered = false;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData?.error?.code === 'tool_use_failed') {
          const failedGen = errorData.error.failed_generation;
          if (failedGen) {
            // Cố gắng cứu vãn lỗi cú pháp của Groq/Llama cực kỳ dị dạng
            const nameMatch = failedGen.match(/function=([a-zA-Z0-9_]+)/);
            const jsonStart = failedGen.indexOf('{');
            const jsonEnd = failedGen.lastIndexOf('}');

            if (nameMatch && jsonStart !== -1 && jsonEnd !== -1 && jsonEnd >= jsonStart) {
              const funcName = nameMatch[1];
              const funcArgs = failedGen.substring(jsonStart, jsonEnd + 1);

              responseMessage = {
                role: 'assistant',
                content: '',
                tool_calls: [{
                  id: 'call_' + Math.random().toString(36).substring(7),
                  type: 'function',
                  function: {
                    name: funcName,
                    arguments: funcArgs
                  }
                }]
              };
              recovered = true;
              console.log('Successfully recovered from Groq 400 tool_use_failed via smart extract:', funcName, funcArgs);
            }
          }

          if (!recovered) {
            console.warn('Groq API Tool Use Failed. Retrying with syntax hint...');
            const retryMessages = [
              ...apiMessages,
              { role: 'user', content: 'Lưu ý hệ thống: Lời gọi hàm vừa rồi bị lỗi cú pháp JSON. Vui lòng gọi lại hàm bằng định dạng JSON chuẩn.' }
            ];
            return await this.callGroqWithTools(retryMessages, tools, depth + 1, retryCount);
          }
        }
      } catch (e) {
        // Bỏ qua lỗi parse error json
      }

      if (!recovered) {
        throw new InternalServerErrorException('Failed to call AI API');
      }
    } else {
      const groqData = await response.json();
      responseMessage = groqData.choices[0]?.message;
    }

    // Fallback: Xử lý trường hợp AI sinh ra raw tool call text (bị leak ra content)
    let toolCalls = responseMessage.tool_calls || [];
    if (responseMessage.content) {
      const functionMatch = responseMessage.content.match(/<function=(\w+)>([\s\S]*?)<\/function>/);
      if (functionMatch && (!toolCalls || toolCalls.length === 0)) {
        toolCalls = [{
          id: 'call_' + Math.random().toString(36).substring(7),
          type: 'function',
          function: {
            name: functionMatch[1],
            arguments: functionMatch[2]
          }
        }];
      }
      // Dọn dẹp content để không in ra chuỗi function rác cho người dùng
      responseMessage.content = responseMessage.content.replace(/<function=\w+>[\s\S]*?<\/function>/g, '').trim();
    }

    // Kiểm tra xem AI có yêu cầu gọi Tool không
    if (toolCalls && toolCalls.length > 0) {
      const assistantMsg = {
        role: "assistant",
        tool_calls: toolCalls,
        content: responseMessage.content || ""
      };
      apiMessages.push(assistantMsg);

      // Thực thi song song hoặc tuần tự các tool gán kết quả
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;

        let toolResult: any = null;
        try {
          const args = JSON.parse(toolCall.function.arguments || '{}');
          console.log(`\n[AI TOOL CALL] Function: ${functionName}`);
          console.log(`[AI TOOL CALL] Args:`, args);

          if (functionName === 'get_hospitals') {
            const hospitals = await this.hospitalsService.findAll(args.city);
            // Giới hạn 5 kết quả để tiết kiệm token
            toolResult = hospitals.slice(0, 5).map(h => ({ id: h.id, name: h.name, city: h.city }));
          } else if (functionName === 'get_doctors') {
            const doctorsResponse = await this.doctorsService.findAll(args.hospitalId);
            const allDoctors = doctorsResponse.data || [];
            let filteredDoctors = allDoctors;
            if (args.specialty) {
              const term = args.specialty.toLowerCase();
              filteredDoctors = allDoctors.filter(d =>
                (d.category && d.category.name.toLowerCase().includes(term))
              );
            }
            // Giới hạn 5 bác sĩ để tiết kiệm token
            toolResult = filteredDoctors.slice(0, 5).map(d => ({
              id: d.id,
              name: d.user?.full_name || 'Bác sĩ',
              specialty: d.category?.name,
              hospitals: (d.hospitals || []).map(h => ({ id: h.id, name: h.name }))
            }));
          } else if (functionName === 'get_service_packages') {
            const allPackages = await this.servicePackagesService.findAll();
            let filtered = allPackages.filter(p => p.is_active);
            if (args.keyword) {
              const term = args.keyword.toLowerCase();
              filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
            }
            toolResult = filtered.slice(0, 5).map(p => ({
              id: p.id,
              name: p.name,
              price: p.fixed_price,
              hospitals: (p.hospitals || []).map(h => ({ id: h.id, name: h.name }))
            }));
          } else if (functionName === 'get_available_slots') {
            let parsedDate = args.date;
            // Chống lỗi AI trả về DD-MM-YYYY hoặc DD/MM/YYYY
            if (parsedDate && parsedDate.match(/^\d{2}[-\/]\d{2}[-\/]\d{4}$/)) {
              const parts = parsedDate.split(/[-\/]/);
              parsedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            const slots = await this.appointmentsService.getAvailableTimes(args.doctorId, parsedDate);
            toolResult = slots;
          } else {
            toolResult = { error: 'Unknown tool' };
          }
        } catch (err) {
          toolResult = { error: err.message };
        }

        apiMessages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(toolResult)
        });
      }

      // Đệ quy: Bắt buộc truyền \`tools\` để AI có quyền quyết định gọi tool thêm lần nữa.
      return await this.callGroqWithTools(apiMessages, tools, depth + 1, 0);
    }

    // Khi AI KHÔNG gọi tool nữa => chuyển sang FINAL JSON MODE với model nhỏ hơn
    return await this.finalizeJson(apiMessages, responseMessage.content);
  }

  private async finalizeJson(apiMessages: any[], aiProposedReply?: string, retryCount: number = 0): Promise<any> {
    const groqApiKey = this.getGroqApiKey();

    const finalMessages = [
      ...apiMessages,
      {
        role: 'system',
        content: `IMPORTANT: Extract the conversation state into JSON ONLY. Do not output plain text.
${aiProposedReply ? `The assistant's reply is: ${JSON.stringify(aiProposedReply)}. Put this exact text in the "reply" field.` : ''}

REQUIRED JSON SCHEMA:
{
  "reply": "str (câu trả lời gửi cho user)",
  "bookingData": { "hospitalId": int|null, "hospitalName": "str", "specialty": "str", "doctorId": int|null, "doctorName": "str", "packageId": int|null, "packageName": "str", "date": "YYYY-MM-DD", "time": "HH:mm", "symptoms": "str" },
  "isComplete": bool (CHỈ ĐƯỢC = true NẾU đã đủ tất cả data VÀ người dùng ĐÃ XÁC NHẬN ĐỒNG Ý đặt lịch ở tin nhắn cuối. Nếu chưa xác nhận, false)
}`
      }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Dùng model nhỏ hơn để format JSON, tiết kiệm token & limit
        messages: finalMessages,
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      }),
    });

    if (response.status === 429) {
      if (retryCount >= 5) throw new InternalServerErrorException('Groq Rate Limit Exceeded after retries');
      
      const keysCount = this.getGroqApiKeys().length;
      if (keysCount > 1) {
        this.switchGroqApiKey();
        await new Promise(r => setTimeout(r, 1000));
      } else {
        console.warn("Groq API Rate Limit (429) in finalize phase. Retrying in 5s...");
        await new Promise(r => setTimeout(r, 5000));
      }
      return await this.finalizeJson(apiMessages, aiProposedReply, retryCount + 1); // Retry without pushing duplicate system prompt
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error in finalizeJson:', errorText);
      throw new InternalServerErrorException('Failed to format AI response as JSON');
    }

    const groqData = await response.json();
    const responseMessage = groqData.choices[0]?.message;

    let content = responseMessage.content || '{}';
    content = content.replace(/```json\n?/gi, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse AI response as JSON in finalize:', content);
      return {
        reply: "Xin lỗi, tôi gặp chút vấn đề khi xử lý câu trả lời. Bạn có thể nói lại được không?",
        bookingData: {},
        isComplete: false
      };
    }
  }
}
