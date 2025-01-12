-- Add API key columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN api_openai text,
ADD COLUMN api_anthropic text,
ADD COLUMN api_grok text,
ADD COLUMN api_perplexity text;

-- Add comments to explain the columns
COMMENT ON COLUMN public.profiles.api_openai IS 'OpenAI API key';
COMMENT ON COLUMN public.profiles.api_anthropic IS 'Anthropic API key';
COMMENT ON COLUMN public.profiles.api_grok IS 'Grok API key';
COMMENT ON COLUMN public.profiles.api_perplexity IS 'Perplexity API key'; 