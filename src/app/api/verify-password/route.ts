import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ success: false, error: 'Mật khẩu không được để trống' }, { status: 400 });
    }

    const setting = await Setting.findOne({ key: 'site_password' });
    const storedPassword = setting ? setting.value : '1234567890'; // fallback to default

    if (password === storedPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Mật khẩu không chính xác' });
    }
  } catch (error) {
    console.error('[API] verify-password error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
