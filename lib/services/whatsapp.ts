export async function sendWhatsappThankMsg(
  name: string,
  phoneNo: string,
  receiptNo: string,
  totalAmount: number,
  mediaId: string,
) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NO_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneNo,
          type: "template",
          template: {
            name: "sales_thanks",
            language: {
              code: "en",
            },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "document",
                    document: {
                      id: mediaId,
                      filename: `${receiptNo}.pdf`,
                    },
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    parameter_name: "name",
                    text: name,
                  },
                  {
                    type: "text",
                    parameter_name: "receipt_id",
                    text: receiptNo,
                  },
                  {
                    type: "text",
                    parameter_name: "total",
                    text: totalAmount.toString(),
                  },
                ],
              },
            ],
          },
        }),
      },
    );
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("whatsapp error in sendWhatsappThankMsg: ", error);
    throw error;
  }
}

export async function uploadMedia(pdfBuffer: Buffer) {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(pdfBuffer)], {
    type: "application/pdf",
  });
  formData.append("file", blob);
  formData.append("messaging_product", "whatsapp");
  try {
    const res = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NO_ID}/media`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
        body: formData,
      },
    );
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`WhatsApp Media Upload error: ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("whatsapp error in uploadMedia: ", error);
    throw error;
  }
}
