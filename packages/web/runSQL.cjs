const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Gafe362215.@db.reqhddvgquiomxvqvcdn.supabase.co:5432/postgres',
});

const sql = `
-- ─── Candidatos ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  data_nascimento DATE,
  -- Dados do formulário de inscrição (preenchidos no app)
  experiencia_previa TEXT,       -- 'nenhuma' | 'iniciante' | 'intermediario' | 'avancado'
  motivacao TEXT,                -- Por que quer treinar boxe?
  como_conheceu TEXT,            -- Como conheceu o CT?
  disponibilidade TEXT,          -- Dias/horários preferidos
  tem_condicao_medica BOOLEAN DEFAULT false,
  descricao_condicao TEXT,
  -- Gestão
  status TEXT NOT NULL DEFAULT 'aguardando'
    CHECK (status IN ('aguardando', 'aprovado', 'reprovado')),
  observacoes_internas TEXT,     -- Notas do professor (não visível ao candidato)
  motivo_reprovacao TEXT,
  data_decisao TIMESTAMPTZ,
  aluno_id UUID REFERENCES alunos(id), -- preenchido quando aprovado
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'candidatos' AND policyname = 'Admin autenticado pode tudo em candidatos'
    ) THEN
        CREATE POLICY "Admin autenticado pode tudo em candidatos" ON candidatos FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

DROP TRIGGER IF EXISTS candidatos_updated_at ON candidatos;
CREATE TRIGGER candidatos_updated_at BEFORE UPDATE ON candidatos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Posts do feed ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conteudo TEXT NOT NULL,
  imagem_url TEXT,
  autor TEXT NOT NULL DEFAULT 'Argel Riboli',
  total_curtidas INTEGER DEFAULT 0,
  total_comentarios INTEGER DEFAULT 0,
  publicado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Admin autenticado pode tudo em posts'
    ) THEN
        CREATE POLICY "Admin autenticado pode tudo em posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Stories ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imagem_url TEXT,
  legenda TEXT,
  autor TEXT NOT NULL DEFAULT 'Argel Riboli',
  expira_em TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  total_visualizacoes INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'stories' AND policyname = 'Admin autenticado pode tudo em stories'
    ) THEN
        CREATE POLICY "Admin autenticado pode tudo em stories" ON stories FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- ─── View: stories ativos (não expirados) ────────────────────────────────────
CREATE OR REPLACE VIEW stories_ativos AS
SELECT * FROM stories
WHERE ativo = true AND expira_em > NOW()
ORDER BY created_at DESC;

-- ─── BUCKET ct-boxe-media e POLICIES ─────────────────────────────────────────

-- Insert bucket se nao existe (banco postgres via role supabase_admin precisa fazer assim)
INSERT INTO storage.buckets (id, name, public) VALUES ('ct-boxe-media', 'ct-boxe-media', true) ON CONFLICT DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin pode fazer upload de midia'
    ) THEN
        CREATE POLICY "Admin pode fazer upload de midia" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ct-boxe-media');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Midia publica para leitura'
    ) THEN
        CREATE POLICY "Midia publica para leitura" ON storage.objects FOR SELECT TO public USING (bucket_id = 'ct-boxe-media');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin pode deletar midia'
    ) THEN
        CREATE POLICY "Admin pode deletar midia" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ct-boxe-media');
    END IF;
END
$$;


-- ─── GRANTS ──────────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

-- ─── Dados de exemplo ────────────────────────────────────────────────────────
INSERT INTO candidatos (nome, email, telefone, experiencia_previa, motivacao, como_conheceu, status) VALUES
  ('Pedro Augusto Lima', 'pedro.lima@email.com', '(41) 99111-1111', 'nenhuma', 'Sempre quis aprender boxe para condicionamento e autodefesa.', 'Instagram do CT', 'aguardando'),
  ('Bruno Cavalcante', 'bruno.cav@email.com', '(41) 99222-2222', 'iniciante', 'Treinei 3 meses em outro CT mas quero evoluir com um professor mais dedicado.', 'Indicação de amigo', 'aguardando'),
  ('Rodrigo Pimentel', 'rodpim@email.com', '(41) 99333-3333', 'intermediario', 'Competidor amador querendo subir de nível.', 'Google', 'aprovado'),
  ('Henrique Matos', 'hm@email.com', '(41) 99444-4444', 'nenhuma', 'Perder peso e ganhar disciplina.', 'Instagram do CT', 'reprovado')
ON CONFLICT DO NOTHING;

INSERT INTO posts (conteudo, autor) VALUES
  ('🥊 Parabéns ao nosso atleta Carlos Mendes pela vitória no campeonato estadual! Muito orgulho do trabalho que fizemos juntos. Esse resultado é de vocês também!', 'Argel Riboli'),
  ('⚠️ Lembrete: esta semana teremos aula especial de sparring na quinta-feira às 19h. Vagas limitadas a 12 alunos. Se inscreva pelo app!', 'Argel Riboli')
ON CONFLICT DO NOTHING;
`;

async function main() {
  try {
    await client.connect();
    console.log('Deploying Fase 6...');
    await client.query(sql);
    console.log('Success.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
