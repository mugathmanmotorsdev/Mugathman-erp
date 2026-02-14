export async function sendWhatsappThankMsg(
  id: string,
  name: string,
  phoneNo: string,
  receiptNo: string,
  totalAmount: number,
  mediaId: string,
) {
  //   curl 'https://graph.facebook.com/<API_VERSION>/<WHATSAPP_BUSINESSS_PHONE_NUMBER_ID>/messages' \
  // -H 'Content-Type: application/json' \
  // -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  // -d '
  // {
  //   "messaging_product": "whatsapp",
  //   "recipient_type": "individual",
  //   "to": "<WHATSAPP_USER_PHONE_NUMBER>",
  //   "type": "template",
  //   "template": {
  //     "name": "<TEMPLATE_NAME>",
  //     "language": {
  //       "code": "<TEMPLATE_LANGUAGE>"
  //     },
  //     "components": [

  //       <!-- Only required if the template uses a media header component -->
  //       {
  //         "type": "header",
  //         "parameters": [
  //           {
  //             "type": "<MEDIA_HEADER_TYPE>",
  //             "<MEDIA_HEADER_TYPE>": {
  //               "id": "<MEDIA_HEADER_ASSET_ID>"
  //             }
  //           }
  //         ]
  //       },

  //       <!-- Only required if the template uses body component parameters -->
  //       {
  //         "type": "body",
  //         "parameters": [
  //           {
  //             "type": "<NAMED_PARAM_TYPE>",
  //             "parameter_name": "<NAMED_PARAM_NAME>",
  //             "text": "<NAMED_PARAM_VALUE>"
  //           },

  //           <!-- Additional parameters values would follow, if needed -->

  //         ]
  //       }
  //     ]
  //   }
  // }'


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
            name: "sales_done",
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
    console.log("whatsapp send response: ", data);
  } catch (error) {
    console.log("whatsapp error: ", error);
  }
}

export async function uploadMedia(pdfBuffer: Buffer, filename: string) {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(pdfBuffer)], {
    type: "application/pdf",
  });
  formData.append("file", blob, filename);
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
    console.log("whatsapp upload media response: ", data);

    return data;
  } catch (error) {
    console.log("whatsapp error: ", error);
  }
}
