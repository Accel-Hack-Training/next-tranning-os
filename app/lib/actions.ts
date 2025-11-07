"use server"; //ファイル内のエクスポートされたすべての関数をサーバーアクションとしてマークする

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; 
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require'});

// ②スキーマの定義
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), // z.coerceで数値型に強制変換
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true }); // ③omit(xxx)で記述したxxxを除外して新しいスキーマを作成(使うものだけ取得できる)

const UpdateInvoice = FormSchema.omit({ id: true, date: true }); // invoice更新する用

// ④CreateInvoiceを使って型検証
export async function createInvoice(formData: FormData) {
  const {customerId, amount, status} = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100; //金額をセントに変換
  const date = new Date().toISOString().split('T');

  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices'); // リダイレクト
}

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
