import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DoctorsService } from '../doctors/doctors.service';
import { HospitalsService } from '../hospitals/hospitals.service';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class AiService {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly hospitalsService: HospitalsService,
    private readonly appointmentsService: AppointmentsService,
  ) { }

  async processChat(messages: any[], bookingData: any): Promise<any> {
    try {
      const systemPrompt = `
Vai trò: Trợ lý y tế STL Clinic. Đặt lịch khám bệnh. Trả lời ngắn gọn, ân cần.
Mục tiêu thu thập: Triệu chứng/Khoa, Bệnh viện, Bác sĩ, Ngày, Giờ.
- Fast-track: Gọi ngay các tool (có thể liên tiếp/song song) nếu có sẵn data. KHÔNG hỏi vòng vo.
- Giờ khám: BẮT BUỘC dùng tool lấy giờ trống. Nếu user chưa chọn hoặc giờ không khớp, HÃY liệt kê và YÊU CẦU user chọn cụ thể 1 giờ.
- Tự gợi ý bác sĩ nếu user không chọn. 
- BƯỚC CUỐI CÙNG: CHỈ KHI đã chốt ĐÚNG 1 giờ khám cụ thể và đủ TẤT CẢ thông tin, mới TÓM TẮT lại và HỎI người dùng "Bạn có đồng ý đặt lịch này không?". 
- TUYỆT ĐỐI KHÔNG tự động chốt nếu người dùng chưa trả lời đồng ý/xác nhận.
- Reset data nếu user đổi ý. Dịch tiếng lóng sang y khoa. KHÔNG kê đơn thuốc.

Status: ${JSON.stringify(bookingData)}
Date: ${new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)}
`;

      const apiMessages = [{ role: 'system', content: systemPrompt }, ...messages.slice(-6)];

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
    if (depth > 3) {
      throw new Error("Quá nhiều lần gọi tool liên tiếp.");
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY is not configured');
    }

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
      if (retryCount >= 2) throw new InternalServerErrorException('Groq Rate Limit Exceeded');
      console.warn("Groq API Rate Limit (429) in tool phase. Retrying in 3s...");
      await new Promise(r => setTimeout(r, 3000));
      return await this.callGroqWithTools(apiMessages, tools, depth, retryCount + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);

      try {
        const errorData = JSON.parse(errorText);
        if (errorData?.error?.code === 'tool_use_failed') {
          console.warn('Groq API Tool Use Failed. Retrying with syntax hint...');
          const retryMessages = [
            ...apiMessages,
            { role: 'user', content: 'Lưu ý hệ thống: Lời gọi hàm vừa rồi bị lỗi cú pháp (thiếu dấu > hoặc ngoặc). Bạn chú ý sinh tool call chuẩn JSON, hoặc nếu dùng thẻ XML thì BẮT BUỘC phải đúng định dạng: <function=tên_hàm>{"tham_số":"giá_trị"}</function>. Vui lòng gọi lại.' }
          ];
          return await this.callGroqWithTools(retryMessages, tools, depth + 1, retryCount);
        }
      } catch (e) {
        // Bỏ qua lỗi parse
      }

      throw new InternalServerErrorException('Failed to call AI API');
    }

    const groqData = await response.json();
    const responseMessage = groqData.choices[0]?.message;

    // Kiểm tra xem AI có yêu cầu gọi Tool không
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const assistantMsg = {
        role: "assistant",
        tool_calls: responseMessage.tool_calls,
        content: responseMessage.content || ""
      };
      apiMessages.push(assistantMsg);

      // Thực thi song song hoặc tuần tự các tool gán kết quả
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments || '{}');

        let toolResult: any = null;
        try {
          if (functionName === 'get_hospitals') {
            const hospitals = await this.hospitalsService.findAll(args.city);
            // Giới hạn 5 kết quả để tiết kiệm token
            toolResult = hospitals.slice(0, 5).map(h => ({ id: h.id, name: h.name, city: h.city }));
          } else if (functionName === 'get_doctors') {
            const allDoctors = await this.doctorsService.findAll(args.hospitalId);
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
          } else if (functionName === 'get_available_slots') {
            const slots = await this.appointmentsService.getAvailableTimes(args.doctorId, args.date);
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
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new InternalServerErrorException('GROQ_API_KEY is not configured');
    }

    const finalMessages = [
      ...apiMessages,
      {
        role: 'system',
        content: `IMPORTANT: Extract the conversation state into JSON ONLY. Do not output plain text.
${aiProposedReply ? `The assistant's reply is: ${JSON.stringify(aiProposedReply)}. Put this exact text in the "reply" field.` : ''}

REQUIRED JSON SCHEMA:
{
  "reply": "str (câu trả lời gửi cho user)",
  "bookingData": { "hospitalId": int|null, "hospitalName": "str", "specialty": "str", "doctorId": int|null, "doctorName": "str", "date": "YYYY-MM-DD", "time": "HH:mm", "symptoms": "str" },
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
      if (retryCount >= 2) throw new InternalServerErrorException('Groq Rate Limit Exceeded');
      console.warn("Groq API Rate Limit (429) in finalize phase. Retrying in 3s...");
      await new Promise(r => setTimeout(r, 3000));
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
