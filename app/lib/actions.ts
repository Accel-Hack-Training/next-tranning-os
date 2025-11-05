"use server"; //ファイル内のエクスポートされたすべての関数をサーバーアクションとしてマークする

import { z } from "zod"; // ①import

// ②スキーマの定義
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), // z.coerceで数値型に強制変換
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true }); // ③omit(xxx)で記述したxxxを除外して新しいスキーマを作成(使うものだけ取得できる)

// ④CreateInvoiceを使って型検証
export async function createInvoice(formData: FormData) {
  // const {customerId, amount, status} = CreateInvoice.parse({
  //   customerId: formData.get("customerId"),
  //   amount: formData.get("amount"),
  //   status: formData.get("status"),
  // });

  // 上記と同じ動作
  const form  = {
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  };
  const invoice = CreateInvoice.parse(form);
  const  {customerId, amount, status} = invoice;

  console.log('form', form);
  console.log('invoice', invoice);
}
