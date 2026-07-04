import { requireAuth } from "@/lib/auth/guards";
import { ChatInterface } from "@/features/ai/components/chat-interface";

export const metadata = { title: "AI Assistant" };

export default async function AIPage() {
  await requireAuth();
  
  return (
    <div className="animate-fade-in -m-8">
      <ChatInterface />
    </div>
  );
}
