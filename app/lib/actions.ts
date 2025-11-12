"use server"; //ファイル内のエクスポートされたすべての関数をサーバーアクションとしてマークする

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; 
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require'});

// ②スキーマの定義
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }),
  amount: z.coerce.number()// z.coerceで数値型に強制変換
                  .gt(0, { message: 'Please enter an amount greater than $0.'}), //常に0より大きくなるようにする(gt: greater thanの略, >)
  status: z.enum(["pending", "paid"], {
    invalid_type_error: 'Please select an invoice status',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true }); // ③omit(xxx)で記述したxxxを除外して新しいスキーマを作成(使うものだけ取得できる)

const UpdateInvoice = FormSchema.omit({ id: true, date: true }); // invoice更新する用


// 公式通りでやると型に関するエラー出たため処理を切り出し
function backErrorMessageForCreateInvoice (): string {
  return 'Database Error: Failed to Create Invoice.';
}

function backErrorMessageForUpdateInvoice (): string {
  return 'Database Error: Failed to Update Invoice.';
}

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// ④CreateInvoiceを使って型検証
export async function createInvoice(prevState: State, formData: FormData) { // prevStateにはuseActionStateフックから渡された状態が入っている
  const {customerId, amount, status} = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100; //金額をセントに変換
  const date = new Date().toISOString().split('T');

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
  } catch (error) {
    console.error(error);
    backErrorMessageForCreateInvoice();
  }

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

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    console.error(error);
    backErrorMessageForUpdateInvoice();
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
