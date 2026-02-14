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
    const data = await res.json();
  } catch (error) {
    console.log("whatsapp error: ", error);
  }
}

export async function uploadMedia(pdfBuffer: Buffer, filename: string) {
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
    const data = await res.json();

    return data;
  } catch (error) {
    console.log("whatsapp error: ", error);
  }
}
