import LoginForm from "./LoginForm";

export default function AdminLogin() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-center font-serif text-4xl tracking-[0.06em]">KĀYA</p>
        <p className="mt-1 text-center text-[13px] text-muted">Store admin</p>
        <div className="mt-8 rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
