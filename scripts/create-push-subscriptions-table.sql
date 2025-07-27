-- Tabelle für Push-Benachrichtigungen Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- RLS (Row Level Security) aktivieren
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Jeder kann seine eigenen Subscriptions einsehen" 
ON push_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Jeder kann seine eigenen Subscriptions erstellen" 
ON push_subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Jeder kann seine eigenen Subscriptions aktualisieren" 
ON push_subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Jeder kann seine eigenen Subscriptions löschen" 
ON push_subscriptions FOR DELETE 
USING (auth.uid() = user_id);

-- Admin kann alle Subscriptions einsehen (für das Senden von Push-Benachrichtigungen)
CREATE POLICY "Service Role kann alle Subscriptions einsehen" 
ON push_subscriptions FOR SELECT 
USING (auth.role() = 'service_role');

-- Function zum automatischen Aktualisieren des updated_at Feldes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatisches Aktualisieren von updated_at
CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON push_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Beispiel-Kommentare für die Tabelle
COMMENT ON TABLE push_subscriptions IS 'Speichert Push-Benachrichtigungen Subscriptions für Web Push API';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Eindeutige Push-Service Endpoint URL';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'P256DH Schlüssel für Web Push Verschlüsselung';
COMMENT ON COLUMN push_subscriptions.auth IS 'Auth Schlüssel für Web Push Authentifizierung';
COMMENT ON COLUMN push_subscriptions.user_id IS 'Verknüpfung zum Benutzer (optional, für anonyme Subscriptions kann NULL sein)';

-- Bereinigungsfunktion für alte/inaktive Subscriptions (optional)
CREATE OR REPLACE FUNCTION cleanup_old_push_subscriptions()
RETURNS void AS $$
BEGIN
    -- Lösche Subscriptions, die älter als 90 Tage sind und nicht mehr verwendet werden
    DELETE FROM push_subscriptions 
    WHERE updated_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;