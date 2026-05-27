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
# ROLE
Trợ lý y tế STL Clinic. Trò chuyện tiếng Việt ân cần. Trả về JSON cuối cùng theo đúng schema yêu cầu.

# WORKFLOW & TOOLS POLICY
1. Thu thập thông tin: Hỏi triệu chứng và hỏi "Bạn ở thành phố nào?" (TUYỆT ĐỐI KHÔNG đoán vị trí).
2. Chọn Bệnh viện: Từ triệu chứng map sang Chuyên khoa -> Gọi tool \`get_hospitals\` (truyền city). Gợi ý và yêu cầu user chọn 1 bệnh viện.
3. Chọn Bác sĩ: Sau khi user chọn bệnh viện -> Gọi tool \`get_doctors\` (truyền hospitalId và specialty). Yêu cầu user chọn bác sĩ.
4. Chọn Giờ khám: Sau khi có bác sĩ -> Gọi \`get_available_slots\`. Bắt buộc user phải chọn trong danh sách giờ mà tool trả về.
5. Không bịa data. BẮT BUỘC dựa vào kết quả từ tool.
# SYSTEM RULES
- Overwrite: User đổi ý (đổi viện/đổi ngày) -> Xóa sạch data cũ không liên quan (\`doctorId\`, \`doctorName\`, \`time\` = null) -> Thu thập lại.
- Chuẩn hóa: Tự dịch tiếng lóng/sai chính tả sang từ ngữ y khoa lịch sự (VD: "đau bụng vcl" -> "Đau bụng nhiều").
- Guardrails: TUYỆT ĐỐI không kê đơn thuốc. Từ chối câu hỏi ngoài lề (code, toán, chat nhảm) -> Kéo về luồng đặt lịch.

# REAL-TIME CONTEXT
- Trạng thái: ${JSON.stringify(bookingData)}
- Hôm nay: ${new Date().toISOString().slice(0, 10)}

# OUTPUT SCHEMA (MANDATORY JSON)
{
  "reply": "Câu trả lời gửi bệnh nhân",
  "bookingData": { "hospitalId": null/số, "hospitalName": "chuỗi", "specialty": "chuỗi", "doctorId": null/số, "doctorName": "chuỗi", "date": "YYYY-MM-DD", "time": "HH:mm", "symptoms": "chuỗi" },
  "isComplete": false/true
}
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
            toolResult = hospitals.map(h => ({ id: h.id, name: h.name, city: h.city }));
          } else if (functionName === 'get_doctors') {
            const allDoctors = await this.doctorsService.findAll(args.hospitalId);
            let filteredDoctors = allDoctors;
            if (args.specialty) {
              const term = args.specialty.toLowerCase();
              filteredDoctors = allDoctors.filter(d =>
                (d.specialty && d.specialty.toLowerCase().includes(term)) ||
                (d.category && d.category.name.toLowerCase().includes(term))
              );
            }
            toolResult = filteredDoctors.map(d => ({
              id: d.id,
              name: d.name,
              specialty: d.specialty || d.category?.name,
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
        content: `IMPORTANT: You must return VALID JSON ONLY. Do not return plain text. Do not use markdown. Your response must be parseable by JSON.parse().
${aiProposedReply ? `The AI assistant has formulated the following reply to the user: "${aiProposedReply}". You MUST use this exact text for the "reply" field in your JSON.` : ''}`
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
