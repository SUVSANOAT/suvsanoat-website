import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      company,
      objectType,
      capacity,
      message,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Укажите имя и телефон" },
        { status: 400 }
      );
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error("Telegram environment variables are missing");

      return NextResponse.json(
        {
          success: false,
          message: "Telegram не настроен",
        },
        { status: 500 }
      );
    }

    const telegramMessage = `
🔵 НОВАЯ ЗАЯВКА — SUVSANOAT

👤 Имя:
${name || "Не указано"}

🏢 Компания:
${company || "Не указана"}

📞 Телефон / Telegram:
${phone || "Не указан"}

🏭 Тип объекта:
${objectType || "Не указан"}

💧 Производительность:
${capacity || "Не указана"}

📝 Задача клиента:
${message || "Не указана"}

━━━━━━━━━━━━━━
🌐 Заявка с сайта SUVSANOAT
`;

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
        }),
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error("Telegram API error:", telegramData);

      return NextResponse.json(
        {
          success: false,
          message: "Ошибка отправки в Telegram",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Заявка успешно отправлена",
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Ошибка сервера",
      },
      { status: 500 }
    );
  }
}