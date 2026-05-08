-- L7 Talents - Schema completo do banco de dados

-- OTP por email (para admin)
CREATE TABLE IF NOT EXISTS email_otp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_otp_user ON email_otp(user_id);

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuários (base para candidatos e empregadores)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('candidato', 'empregador', 'admin', 'financeiro', 'rh')),
  ativo BOOLEAN DEFAULT true,
  email_verificado BOOLEAN DEFAULT false,
  email_alternativo VARCHAR(255),
  whatsapp VARCHAR(20),
  plano_ativo VARCHAR(50),
  plano_expira_em TIMESTAMP,
  senha_temporaria BOOLEAN DEFAULT false,
  totp_secret VARCHAR(64),
  totp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Perfil do candidato
CREATE TABLE IF NOT EXISTS candidatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  cpf VARCHAR(14) UNIQUE,
  data_nascimento DATE,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  linkedin VARCHAR(255),
  github VARCHAR(255),
  portfolio VARCHAR(255),
  cargo_desejado VARCHAR(255),
  area_atuacao VARCHAR(100),
  nivel_experiencia VARCHAR(50),
  pretensao_salarial DECIMAL(10,2),
  disponibilidade VARCHAR(50),
  modalidade VARCHAR(50),
  resumo_profissional TEXT,
  habilidades TEXT[],
  curriculo_url VARCHAR(500),
  foto_url VARCHAR(500),
  whatsapp VARCHAR(50),
  alertas_vagas BOOLEAN DEFAULT true,
  alerta_email BOOLEAN DEFAULT true,
  alerta_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Experiências profissionais
CREATE TABLE IF NOT EXISTS experiencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  empresa VARCHAR(255) NOT NULL,
  cargo VARCHAR(255) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  atual BOOLEAN DEFAULT false,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Formações acadêmicas
CREATE TABLE IF NOT EXISTS formacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  instituicao VARCHAR(255) NOT NULL,
  curso VARCHAR(255) NOT NULL,
  nivel VARCHAR(50) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  em_andamento BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Perfil do empregador
CREATE TABLE IF NOT EXISTS empregadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome_contato VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE,
  setor VARCHAR(100),
  porte VARCHAR(50),
  site VARCHAR(255),
  linkedin VARCHAR(255),
  telefone VARCHAR(50),
  whatsapp VARCHAR(50),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  descricao TEXT,
  logo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vagas
CREATE TABLE IF NOT EXISTS vagas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empregador_id UUID NOT NULL REFERENCES empregadores(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  requisitos TEXT,
  beneficios TEXT,
  area VARCHAR(100),
  nivel VARCHAR(50),
  modalidade VARCHAR(50) CHECK (modalidade IN ('presencial', 'remoto', 'hibrido')),
  tipo_contrato VARCHAR(50) CHECK (tipo_contrato IN ('clt', 'pj', 'estagio', 'temporario', 'freelance')),
  salario_min DECIMAL(10,2),
  salario_max DECIMAL(10,2),
  salario_oculto BOOLEAN DEFAULT false,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  habilidades TEXT[],
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'encerrada')),
  destaque BOOLEAN DEFAULT false,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidaturas
CREATE TABLE IF NOT EXISTS candidaturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'enviada' CHECK (status IN ('enviada', 'visualizada', 'em_analise', 'entrevista', 'aprovado', 'reprovado')),
  carta_apresentacao TEXT,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(vaga_id, candidato_id)
);

-- Mensagens entre candidato e empregador
CREATE TABLE IF NOT EXISTS mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidatura_id UUID NOT NULL REFERENCES candidaturas(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL REFERENCES users(id),
  conteudo TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vagas salvas pelo candidato
CREATE TABLE IF NOT EXISTS vagas_salvas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(candidato_id, vaga_id)
);

-- Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- Comunicados enviados pela coordenadora de RH
CREATE TABLE IF NOT EXISTS comunicados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  destinatario VARCHAR(20) NOT NULL CHECK (destinatario IN ('todos','candidatos','empregadores')),
  canal VARCHAR(20) NOT NULL CHECK (canal IN ('email','whatsapp','ambos')),
  enviado_por UUID REFERENCES users(id),
  total_enviados INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rastreamento de acessos por device
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page VARCHAR(255),
  device VARCHAR(20) CHECK (device IN ('mobile','desktop','tablet')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_page_views_device ON page_views(device);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(created_at);

-- Pedidos / assinaturas de pacotes
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pacote VARCHAR(50) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','recusado','cancelado','reembolsado')),
  mp_preference_id VARCHAR(255),
  mp_payment_id VARCHAR(255),
  mp_status VARCHAR(50),
  email_comprador VARCHAR(255),
  nome_comprador VARCHAR(255),
  empresa VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pedidos_user ON pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vagas_status ON vagas(status);
CREATE INDEX IF NOT EXISTS idx_vagas_area ON vagas(area);
CREATE INDEX IF NOT EXISTS idx_vagas_empregador ON vagas(empregador_id);
CREATE INDEX IF NOT EXISTS idx_candidaturas_candidato ON candidaturas(candidato_id);
CREATE INDEX IF NOT EXISTS idx_candidaturas_vaga ON candidaturas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes(user_id, lida);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_candidatos_updated BEFORE UPDATE ON candidatos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_empregadores_updated BEFORE UPDATE ON empregadores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_vagas_updated BEFORE UPDATE ON vagas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_candidaturas_updated BEFORE UPDATE ON candidaturas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_pedidos_updated BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
