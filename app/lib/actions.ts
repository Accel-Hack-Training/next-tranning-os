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

export async function createInvoice(formData: formData) {
  const rawFormData = {
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  };

  console.log(typeof rawFormData.amount);
}
