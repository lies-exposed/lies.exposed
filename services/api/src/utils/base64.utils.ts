type ContentType = "image";

const imageRexExp = /^data:image\/\w+;base64,/;

export const getBufferFromBase64 = (
  content: string,
  type: ContentType
): Buffer => {
  const regExp = imageRexExp;
  return Buffer.from(content.replace(regExp, ""), "base64");
};
