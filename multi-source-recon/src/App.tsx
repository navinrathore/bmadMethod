
import { ChatWindow } from './components/chat/ChatWindow';
import { SidePanel } from './components/panel/SidePanel';

function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* Left/Center Pane: Chat Area (60% width) */}
      <main className="w-full lg:w-3/5 h-full flex flex-col shrink-0">
        <ChatWindow />
      </main>

      {/* Right Pane: Data Panel (40% width) */}
      <aside className="hidden lg:flex w-2/5 h-full flex-col shrink-0">
        <SidePanel />
      </aside>
    </div>
  );
}

export default App;
