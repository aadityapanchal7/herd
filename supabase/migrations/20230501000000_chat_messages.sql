
-- Create a table for chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable row level security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies to control access
CREATE POLICY "Anyone can read chat messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert their own messages" 
  ON public.chat_messages 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Set up real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
