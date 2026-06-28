-- Backup L7 Talents 2026-06-28T12:47:38.323Z
SET session_replication_role = replica;

DELETE FROM users;
INSERT INTO users ("id","email","password_hash","role","ativo","email_verificado","created_at","updated_at","totp_secret","totp_enabled","email_alternativo","whatsapp","plano_ativo","plano_expira_em","senha_temporaria") VALUES ('7d116850-7fe4-4ff9-91a3-68836ccccc0b','sre@vincitore.space','$2a$10$Wvz6Vas/O6tx9dFBSyOJGOmJmxe8kuqmcrBOdXUpHiZC9lNwXLjWi','empregador',true,false,'2026-05-02T22:52:59.985Z','2026-05-02T22:52:59.985Z',NULL,false,NULL,NULL,NULL,NULL,false);
INSERT INTO users ("id","email","password_hash","role","ativo","email_verificado","created_at","updated_at","totp_secret","totp_enabled","email_alternativo","whatsapp","plano_ativo","plano_expira_em","senha_temporaria") VALUES ('6d1066a9-8453-44d5-923b-de56cd0051ce','vincitore.corp@gmail.com','$2a$10$qFI3ZNhAtaXFqxNVjMyBYOzsb4jgUPuVcXQuI5qCTtsZuDIHZiLv6','candidato',true,false,'2026-05-02T22:34:09.505Z','2026-05-02T23:49:46.958Z',NULL,false,NULL,NULL,NULL,NULL,false);
INSERT INTO users ("id","email","password_hash","role","ativo","email_verificado","created_at","updated_at","totp_secret","totp_enabled","email_alternativo","whatsapp","plano_ativo","plano_expira_em","senha_temporaria") VALUES ('0ac4ac5f-9378-4e0e-9bf2-0a3113106a9f','financeiro@l7talents.online','$2a$10$VgjRTPN7EvhF8.1ue5sDqeGlo6rB8/EWwBn796l6QG8FNhZ5cIiK.','financeiro',true,false,'2026-05-02T23:41:58.633Z','2026-05-08T02:20:20.032Z',NULL,false,NULL,NULL,NULL,NULL,false);
INSERT INTO users ("id","email","password_hash","role","ativo","email_verificado","created_at","updated_at","totp_secret","totp_enabled","email_alternativo","whatsapp","plano_ativo","plano_expira_em","senha_temporaria") VALUES ('5244c913-e44a-4925-a5ca-09831517cf4b','rh@l7talents.online','$2a$10$Xnp.MtOqZSkg4pMxp457A.BCXq5.YUxtnvRQ/2GZ2me/.EwORiR7a','rh',true,false,'2026-05-08T12:54:42.633Z','2026-05-08T12:54:42.633Z',NULL,false,NULL,NULL,NULL,NULL,false);
INSERT INTO users ("id","email","password_hash","role","ativo","email_verificado","created_at","updated_at","totp_secret","totp_enabled","email_alternativo","whatsapp","plano_ativo","plano_expira_em","senha_temporaria") VALUES ('3472d774-bfb5-4d50-855c-68397f4b371c','comercial@l7talents.online','$2a$10$iCpPfqI9qfvL7ZNCJIMcPeE8R6OIu7OMraoMyHJsFz1XMNs0hj.vW','financeiro',true,false,'2026-05-08T02:22:18.135Z','2026-05-08T16:34:26.915Z','GGDJ2WX5BLPAAWFS3T2SW7LN37FL5RIN',false,NULL,NULL,NULL,NULL,false);
INSERT INTO users ("id","email","password_hash","role","ativo","email_verificado","created_at","updated_at","totp_secret","totp_enabled","email_alternativo","whatsapp","plano_ativo","plano_expira_em","senha_temporaria") VALUES ('e0d9f69b-56aa-4b42-8de6-3ae3bab0ec7e','specinatti@gmail.com','$2a$10$EaNbDUJMoou1Ye4YnpOMIODmGY5aCa8.UYB3UTHVWS0Qr5qT1TWWy','admin',true,false,'2026-05-08T16:39:47.761Z','2026-05-08T18:14:18.259Z',NULL,false,'vincitore.corp@gmail.com','11983186310',NULL,NULL,false);
INSERT INTO users ("id","email","password_hash","role","ativo","email_verificado","created_at","updated_at","totp_secret","totp_enabled","email_alternativo","whatsapp","plano_ativo","plano_expira_em","senha_temporaria") VALUES ('f4e01b06-156b-467c-b6ed-af9dc7e52bc1','gil.aninha1988@gmail.com','$2a$10$DOwU/GtMi/MJT5v6WF8WTeoZG372Ii/y9MY/VmYjRLK9k4XNY8Z5.','candidato',true,false,'2026-05-12T18:37:39.687Z','2026-05-12T18:37:39.687Z',NULL,false,NULL,NULL,NULL,NULL,false);
-- 7 registros

DELETE FROM candidatos;
INSERT INTO candidatos ("id","user_id","nome","telefone","cpf","data_nascimento","cidade","estado","linkedin","github","portfolio","cargo_desejado","area_atuacao","nivel_experiencia","pretensao_salarial","disponibilidade","modalidade","resumo_profissional","habilidades","curriculo_url","foto_url","created_at","updated_at","whatsapp","alertas_vagas","alerta_email","alerta_whatsapp","disponivel_para_trabalho") VALUES ('78ddd981-b8b7-46a9-bc2d-b37dd70464b9','6d1066a9-8453-44d5-923b-de56cd0051ce','SANDRO BENTO PECINATTI','11983186310',NULL,NULL,'São Paulo',NULL,'https://www.linkedin.com/in/specinatti',NULL,NULL,'Desenvolvedor','Operações','Sênior','6000.00','Imediata','remoto','hhhhhhhhh',ARRAY['kubernetes']::text[],NULL,NULL,'2026-05-02T22:34:09.505Z','2026-05-08T14:31:26.909Z','11983186310',true,true,true,true);
INSERT INTO candidatos ("id","user_id","nome","telefone","cpf","data_nascimento","cidade","estado","linkedin","github","portfolio","cargo_desejado","area_atuacao","nivel_experiencia","pretensao_salarial","disponibilidade","modalidade","resumo_profissional","habilidades","curriculo_url","foto_url","created_at","updated_at","whatsapp","alertas_vagas","alerta_email","alerta_whatsapp","disponivel_para_trabalho") VALUES ('8a7768fd-ee04-4815-88a3-5a14aac83c43','f4e01b06-156b-467c-b6ed-af9dc7e52bc1','Ana Paula Gil de Almeida',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-12T18:37:39.687Z','2026-05-12T18:37:39.687Z',NULL,true,true,false,false);
-- 2 registros

DELETE FROM empregadores;
INSERT INTO empregadores ("id","user_id","nome_contato","razao_social","nome_fantasia","cnpj","setor","porte","site","linkedin","telefone","cidade","estado","descricao","logo_url","created_at","updated_at","whatsapp") VALUES ('55fdef59-6cb4-45a2-91bd-c4f7bba2569e','7d116850-7fe4-4ff9-91a3-68836ccccc0b','vincitore info','teste ltda',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-02T22:52:59.985Z','2026-05-02T22:52:59.985Z',NULL);
-- 1 registros

-- experiencias: vazio

-- formacoes: vazio

-- vagas: vazio

-- candidaturas: vazio

-- mensagens: vazio

-- vagas_salvas: vazio

-- notificacoes: vazio

DELETE FROM pedidos;
INSERT INTO pedidos ("id","user_id","pacote","descricao","valor","status","mp_preference_id","mp_payment_id","mp_status","email_comprador","nome_comprador","empresa","created_at","updated_at") VALUES ('b7b96aa1-6ff2-435e-a0a2-2f551bf534ad',NULL,'business','3 vagas, hunting direcionado, avaliação comportamental, 60 dias','1290.00','pendente',NULL,NULL,NULL,'specinatti@gmail.com','SANDRO BENTO PECINATTI','Vincitore.corp','2026-05-08T02:55:56.338Z','2026-05-08T02:55:56.338Z');
INSERT INTO pedidos ("id","user_id","pacote","descricao","valor","status","mp_preference_id","mp_payment_id","mp_status","email_comprador","nome_comprador","empresa","created_at","updated_at") VALUES ('aa398212-03cb-4d75-8ab2-a3c2902ba141',NULL,'business','3 vagas, hunting direcionado, avaliação comportamental, 60 dias','1290.00','pendente','3387103184-6a94127b-bf70-45b5-a070-4ced5b91794f',NULL,NULL,'specinatti@gmail.com','SANDRO BENTO PECINATTI',NULL,'2026-05-08T02:59:01.240Z','2026-05-08T02:59:02.287Z');
INSERT INTO pedidos ("id","user_id","pacote","descricao","valor","status","mp_preference_id","mp_payment_id","mp_status","email_comprador","nome_comprador","empresa","created_at","updated_at") VALUES ('1de04998-12d3-415f-a91b-1d6531eeecbf',NULL,'teste','Pacote de teste — acesso completo por 7 dias','5.00','pendente','3387103184-4f3dfe3e-4137-4605-9d00-a4513c0808b0',NULL,NULL,'sre@vincitore.space','Novo Comprador','Beethiven First tecnologia','2026-05-08T17:50:54.913Z','2026-05-08T17:50:56.158Z');
-- 3 registros

DELETE FROM page_views;
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('d3eaac4c-e180-4244-99fd-964db8ec6173','/','desktop',NULL,'2026-05-08T02:53:38.704Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('fad34f70-f1fa-4ee8-b6ea-91bc526bbf06','/','desktop',NULL,'2026-05-08T02:53:56.991Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a75aa3d1-7773-472f-8e33-fd6490b9c47e','/pages/login.html','desktop',NULL,'2026-05-08T02:53:59.489Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c67b0e04-3e25-41ba-802e-d1a93df01024','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T02:54:23.611Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ebca54b7-89eb-4452-b97d-14b67ef92bdd','/pages/planos.html','desktop',NULL,'2026-05-08T02:55:23.014Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('76ee6456-cef4-4edc-ba6e-d6e4b84c145f','/pages/checkout.html','desktop',NULL,'2026-05-08T02:55:26.317Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('0f318155-d220-4fdb-80d3-6964878a1503','/','desktop',NULL,'2026-05-08T02:57:57.330Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2739e671-aa77-4961-ad4e-028fb838211d','/pages/login.html','desktop',NULL,'2026-05-08T02:58:00.663Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('131dee46-08ba-42f2-8cbc-2c7757c909c2','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T02:58:34.221Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('1a22d8a0-32b3-47a1-ab6a-b591bbb445ff','/pages/planos.html','desktop',NULL,'2026-05-08T02:58:45.634Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2f0a63cc-d25e-47ba-972f-2755fa27d4ff','/pages/checkout.html','desktop',NULL,'2026-05-08T02:58:48.129Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('1cc08cab-f3de-4bb1-ac13-2179ee4f8b7c','/pages/login.html','desktop',NULL,'2026-05-08T03:09:28.606Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('b94d32be-8d24-4b98-9a44-fddeee78280a','/pages/login.html','desktop',NULL,'2026-05-08T03:11:08.561Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4d465beb-403d-480c-ad3d-ffb9c17d7180','/pages/login.html','desktop',NULL,'2026-05-08T03:25:22.553Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('3cf2b890-1dae-4367-b6c7-9ccb4ce533d3','/pages/login.html','desktop',NULL,'2026-05-08T03:28:45.540Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('bbd37052-67f3-4982-9436-021965d3739d','/pages/planos.html','mobile',NULL,'2026-05-08T12:25:57.609Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('279079d4-1d5c-48ef-9915-4445a1e1ed1f','/pages/planos.html','mobile',NULL,'2026-05-08T12:26:27.243Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('fb175901-f39e-40d9-a239-4b7862ac9dc7','/','desktop',NULL,'2026-05-08T13:53:18.538Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('bda0c65f-927a-4821-826b-dd6c05fbf687','/pages/login.html','desktop',NULL,'2026-05-08T13:53:21.135Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('fa51b88b-7f60-4a13-bb88-4f0fec3aab14','/pages/rh/dashboard.html','desktop',NULL,'2026-05-08T13:53:49.773Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4c4db6b7-f929-4deb-81e3-2617d7b1c04e','/pages/login.html','desktop',NULL,'2026-05-08T13:56:33.497Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7c684ba1-2519-4051-b1b9-a239982c6498','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T13:57:01.751Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('934d8f82-263a-481c-9569-94632367a5aa','/pages/financeiro/markdown.html','desktop',NULL,'2026-05-08T13:57:12.614Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('5de057b8-f2e7-46e8-8f4c-649ca5147f50','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T13:58:36.309Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('fb6f4908-0bf0-4050-8d5d-3c57bf28f758','/pages/financeiro/seguranca.html','desktop',NULL,'2026-05-08T13:58:38.918Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('5d548253-e313-4b54-9669-1c245991bd76','/pages/planos.html','mobile',NULL,'2026-05-08T14:18:32.409Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('aed0efe4-f780-471c-9e27-8ed289aa5ada','/pages/planos.html','mobile',NULL,'2026-05-08T14:18:37.011Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7f4e5ff3-22c7-485c-8c84-82ecfd4cc7b6','/pages/planos.html','mobile',NULL,'2026-05-08T14:18:41.796Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4b4da324-0867-4f4b-8de7-38890f5796e7','/','mobile',NULL,'2026-05-08T14:18:57.421Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('03ae4c75-2e97-48b0-88f1-7bfa87524a85','/pages/login.html','mobile',NULL,'2026-05-08T14:19:00.397Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7ad4abb8-7c5d-4fc2-bc9b-792c86863931','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T14:19:04.206Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('5e225405-cd26-4406-a4d6-2df014df3714','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T14:28:11.514Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('43c63776-c99a-46ce-90d1-343a311c998a','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T14:28:19.400Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4fccaa55-170a-404b-977b-c26757ba6129','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T14:28:22.856Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c9ed9e63-172f-42ec-97b2-137e587f011e','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T14:28:32.627Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('b9399808-db12-4896-b1b3-d69048383faf','/pages/login.html','mobile',NULL,'2026-05-08T14:28:38.355Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('596a80a1-f20a-450e-89d9-7587f484e136','/','desktop',NULL,'2026-05-08T14:28:49.498Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2e283d3f-9463-4d5b-95d5-c02fcb58e018','/pages/login.html','desktop',NULL,'2026-05-08T14:28:51.504Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2a107d99-44d0-4a4b-85ab-8890c81ca097','/pages/candidato/dashboard.html','desktop',NULL,'2026-05-08T14:29:29.721Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('9fbf4321-2f2a-4438-b8f5-96a465ee4fdd','/pages/vagas.html','desktop',NULL,'2026-05-08T14:29:41.104Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('0ea16950-71ee-45ea-85e0-b0c3baa858d7','/pages/candidato/candidaturas.html','desktop',NULL,'2026-05-08T14:29:45.714Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('52b0e4c9-ff39-43d6-bfd4-113a075a5d07','/pages/candidato/vagas-salvas.html','desktop',NULL,'2026-05-08T14:29:49.317Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c5410c96-3815-48a2-935e-3714b8b0b3ff','/pages/vagas.html','desktop',NULL,'2026-05-08T14:29:52.575Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('44ad2ad1-b681-4739-aa31-2735b7b4cca3','/pages/candidato/dashboard.html','desktop',NULL,'2026-05-08T14:29:55.507Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('48ebcdc7-85bb-4e90-bea5-dcd6d53feda6','/pages/vagas.html','desktop',NULL,'2026-05-08T14:30:03.144Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e946b7d8-5823-4c3d-9acd-87d38a800110','/pages/candidato/perfil.html','desktop',NULL,'2026-05-08T14:30:08.000Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('1597ae05-e061-4178-b03f-f4f7aca04b3d','/pages/candidato/candidaturas.html','desktop',NULL,'2026-05-08T14:31:30.530Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('436966fd-575f-4506-85e8-a9b6a59e99ec','/pages/candidato/perfil.html','desktop',NULL,'2026-05-08T14:31:31.884Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('b3041ab8-53be-40b4-8b3d-7ae5077a5833','/pages/vagas.html','desktop',NULL,'2026-05-08T14:31:40.724Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4848b2de-bab9-4197-9d2e-9b6da3bf12a4','/pages/candidato/perfil.html','desktop',NULL,'2026-05-08T14:31:43.203Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ed933c6b-dfa2-418a-9326-60da70aa6b50','/pages/candidato/dashboard.html','desktop',NULL,'2026-05-08T14:31:44.150Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f14a58f9-839a-4613-a4a3-2fdec24dbebd','/pages/vagas.html','desktop',NULL,'2026-05-08T14:31:45.354Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('69f81046-bc01-49e0-a255-ac02c87fe2ea','/pages/candidato/dashboard.html','desktop',NULL,'2026-05-08T14:31:47.137Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('034e2953-e84e-40d6-b701-6f5e5397ed61','/pages/vagas.html','desktop',NULL,'2026-05-08T14:31:49.637Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('d267c83a-976e-4d8c-af02-f92b1598fd4f','/pages/candidato/dashboard.html','desktop',NULL,'2026-05-08T14:31:52.783Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f225b4e9-819f-4c90-8ecf-9344cc5777ba','/pages/candidato/perfil.html','desktop',NULL,'2026-05-08T14:31:56.586Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('0adfae31-2f26-46c1-9923-40d276449f72','/pages/vagas.html','desktop',NULL,'2026-05-08T14:31:58.527Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('81926b2c-5b70-4b8d-8a93-40a5d85b4ddd','/pages/candidato/perfil.html','desktop',NULL,'2026-05-08T14:32:00.066Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('bc8868d4-eeaa-4653-a4a4-d455c364edda','/pages/login.html','desktop',NULL,'2026-05-08T14:32:28.266Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('565b806a-d0c5-43ce-a87d-e36131328ffa','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T14:32:46.669Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('165f99e0-d07e-4e12-b6e4-2de85de05496','/pages/financeiro/docs.html','desktop',NULL,'2026-05-08T14:33:20.390Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('b4698e4f-dcbd-4e22-b0de-159c64c47ad4','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T14:34:04.470Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a446d2df-c7c7-4914-b20d-b594e43c32ae','/pages/login.html','desktop',NULL,'2026-05-08T14:34:05.705Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('79fcef6d-eff0-4ca9-baf6-c56065df2168','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T14:34:12.106Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8f3333f5-5d13-4de5-b260-e1102d9b3a29','/pages/login.html','mobile',NULL,'2026-05-08T14:56:29.067Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e246e89f-2950-4cbd-9726-5217b8833498','/pages/login.html','desktop',NULL,'2026-05-08T15:06:58.175Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('1299c415-6f05-4447-acc7-468a2d7de431','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T15:07:21.145Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7e075903-00e3-45e5-bcd3-247d8f2f3fe2','/pages/login.html','desktop',NULL,'2026-05-08T15:07:33.132Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('d9d24e3e-5edb-4bc8-9852-df67191fe19f','/pages/login.html','desktop',NULL,'2026-05-08T15:07:56.899Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('bf1ace9d-3426-41b4-b416-760ba98c6785','/pages/login.html','mobile',NULL,'2026-05-08T15:11:20.898Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('6c6d95f7-f3ca-4f83-a966-7a651a523904','/pages/login.html','mobile',NULL,'2026-05-08T15:11:24.599Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e41ad6ea-cdcf-4f66-8682-54b3e52628b8','/pages/login.html','mobile',NULL,'2026-05-08T15:11:29.489Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('6e3c4d2a-c72b-425d-ae62-337336f45509','/pages/login.html','mobile',NULL,'2026-05-08T15:11:33.980Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('d8ca17c3-c8a4-4943-bb77-313de0991543','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T15:11:42.684Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a730511a-9872-4794-9a09-0f08a427c353','/pages/login.html','mobile',NULL,'2026-05-08T15:11:43.578Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('6ed14a74-8d44-4202-85b8-d33e48a7402a','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T15:11:50.843Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('849598b4-f20b-45fd-88a2-cc3535ba09ec','/pages/login.html','mobile',NULL,'2026-05-08T15:12:01.887Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f558155e-5377-4686-8f7f-05da39fbab6a','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T15:12:05.880Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7ec6f599-51ec-4a01-ad02-3a3e9a585b8c','/pages/login.html','desktop',NULL,'2026-05-08T15:43:21.012Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('9d3eae36-a142-4ba0-8af4-43d84cd77fa8','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T15:43:25.514Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('0001bbe3-1e79-45e3-946e-b0bc8066eb34','/pages/2fa.html','desktop',NULL,'2026-05-08T15:43:30.652Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c879c92b-abe9-43de-ad20-1c15fa4b3889','/pages/2fa.html','desktop',NULL,'2026-05-08T15:44:18.315Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ed40237e-24a9-4751-8477-a92b94e740be','/pages/2fa.html','desktop',NULL,'2026-05-08T16:00:52.169Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('404d1bfa-96b2-4850-8683-40224ede26e8','/','desktop',NULL,'2026-05-08T16:03:22.848Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a6fb0e8d-b680-4355-84e4-a5cd2c151fcb','/pages/login.html','desktop',NULL,'2026-05-08T16:03:25.158Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('07ce1293-1c08-49a3-9945-941e30656e9d','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T16:03:27.284Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('74c6e42f-69f4-4585-b53d-53c815879076','/pages/2fa.html','desktop',NULL,'2026-05-08T16:03:29.479Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('9859c05c-a90d-41cd-9d16-6a0fe0ad693b','/','desktop',NULL,'2026-05-08T16:10:17.944Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8daa8db4-0680-424b-aefc-481f32be2ff0','/pages/login.html','desktop',NULL,'2026-05-08T16:10:20.494Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('442499a3-f908-47ea-b8d1-c320b8eba7c4','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T16:10:23.052Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('954de072-9bf3-4a49-a2ff-9cbe90959307','/pages/2fa.html','desktop',NULL,'2026-05-08T16:10:27.401Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('0eabfdff-a1ac-442f-922d-1512ae5b89d1','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-08T16:18:46.473Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ea1acb8a-ec93-4d30-a763-83e3aaf87453','/','desktop',NULL,'2026-05-08T16:21:25.587Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('0629391e-14e0-481f-9d13-bc60533fe6f5','/pages/login.html','desktop',NULL,'2026-05-08T16:21:27.271Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2279cfd8-f182-4dfc-a646-e57115e369a1','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T16:21:29.031Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('3b719c46-6a5e-4e2b-a3c0-33c2079bddaa','/','desktop',NULL,'2026-05-08T16:22:34.066Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e87ab5e5-e4a8-46a4-9323-b9e937e85274','/pages/login.html','desktop',NULL,'2026-05-08T16:22:36.437Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('fe0ab38d-d7fd-4411-8a8f-0247a06a1837','/pages/2fa.html','desktop',NULL,'2026-05-08T16:22:39.076Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('1d8eb475-e20b-4258-b527-774293410d02','/','desktop',NULL,'2026-05-08T16:25:24.775Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8c51067f-6b88-4865-b148-cf47868dc119','/pages/login.html','desktop',NULL,'2026-05-08T16:25:52.161Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('fabbabc2-a021-4d8d-8c05-902b3efaa5b9','/pages/2fa.html','desktop',NULL,'2026-05-08T16:25:55.222Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e9a78a40-cec9-47e5-b3ab-68dd8bda6055','/pages/login.html','desktop',NULL,'2026-05-08T16:27:17.193Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('574049de-34a0-4631-afd3-46b5bab27d28','/pages/2fa.html','desktop',NULL,'2026-05-08T16:27:19.060Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e974d2d3-8cad-4632-9ae3-c62628fa8e9a','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T16:27:44.967Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7dceaaf3-eda9-485b-ab3a-6e0e8675eebb','/pages/2fa.html','desktop',NULL,'2026-05-08T16:27:52.359Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('77883816-dcb3-48d3-aab2-bb0e69d3367c','/pages/login.html','desktop',NULL,'2026-05-08T16:28:04.965Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2496c888-c624-4f4e-b9dc-015c93892186','/pages/2fa.html','desktop',NULL,'2026-05-08T16:31:14.322Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f1ecee5e-5334-4167-803b-6b1125d58fa0','/pages/financeiro/dashboard.html','desktop',NULL,'2026-05-08T16:31:25.331Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2ec646ff-0f3c-4e95-9225-0457734c6410','/pages/2fa.html','desktop',NULL,'2026-05-08T16:31:40.468Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('68c0b57d-2245-449a-a216-03bcb439ff6a','/pages/2fa.html','desktop',NULL,'2026-05-08T16:31:50.620Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a013e1d2-4ffe-491f-a81d-3f51ac9b0711','/pages/login.html','desktop',NULL,'2026-05-08T16:31:50.970Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4c1851a5-7f22-4460-8d87-57328ef7f114','/pages/2fa.html','desktop',NULL,'2026-05-08T16:31:52.780Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c8efc9e7-7d5d-47c6-a9bc-3ea8a75436ce','/pages/login.html','desktop',NULL,'2026-05-08T16:31:53.122Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('96adbeae-707c-4ab8-a09a-5c67fb1e2554','/pages/2fa.html','desktop',NULL,'2026-05-08T16:31:57.250Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('b7b26650-1c0e-456a-8753-dc892124a1a8','/pages/login.html','desktop',NULL,'2026-05-08T16:31:57.574Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('019ae8e2-2877-475b-886b-df5f59320924','/pages/login.html','desktop',NULL,'2026-05-08T16:32:01.474Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('355f16d9-0a09-4eb9-9096-d1f7662be68d','/pages/login.html','desktop',NULL,'2026-05-08T16:32:05.302Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c69b993f-2ed0-46d1-a2c3-3e7b14c301b6','/pages/login.html','desktop',NULL,'2026-05-08T16:32:06.419Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('61c03f35-b0c1-4a9d-ab03-d93f5b450f4d','/pages/2fa.html','desktop',NULL,'2026-05-08T16:32:08.417Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('26e6de5c-2ed1-4e49-b249-f16971a83882','/pages/login.html','desktop',NULL,'2026-05-08T16:32:08.729Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('723a9a03-661e-477f-898b-39349e1cd3d0','/pages/login.html','desktop',NULL,'2026-05-08T16:32:49.620Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f71e3969-e457-44f9-8877-4d3e610733b6','/pages/login.html','desktop',NULL,'2026-05-08T16:32:55.457Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c281d4e7-5bb1-42e7-b88a-2b87a86d2469','/pages/2fa.html','desktop',NULL,'2026-05-08T16:34:22.845Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2b78b027-214d-402a-882d-2b76286b9c99','/','desktop',NULL,'2026-05-08T16:49:24.340Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('3099e6ce-1b1d-42b9-8eb1-ce5bd1a98247','/pages/login.html','desktop',NULL,'2026-05-08T16:49:26.846Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('6eeecb40-f705-4ae7-817d-fef5bd61a894','/pages/2fa.html','desktop',NULL,'2026-05-08T16:49:30.643Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8aecb829-4eb8-4bfe-8e79-219152b86a48','/pages/login.html','desktop',NULL,'2026-05-08T16:55:37.075Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a6abf4b3-921e-413d-9263-397c3e6a129a','/pages/2fa.html','desktop',NULL,'2026-05-08T16:55:40.135Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('26357bd8-7676-4384-88af-9f8e38fc8eb5','/pages/login.html','desktop',NULL,'2026-05-08T16:57:57.886Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('b1c8279b-f608-4993-a317-c4998d845ac6','/pages/2fa.html','desktop',NULL,'2026-05-08T16:57:59.333Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('77e0c923-7a78-4541-a0ee-63752d36352e','/','desktop',NULL,'2026-05-08T16:58:53.685Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a1e0abea-4556-4a28-acf5-d3134ab8f577','/pages/login.html','desktop',NULL,'2026-05-08T16:58:57.756Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e1cc8762-815c-4319-bcd8-2cb1cd879729','/pages/2fa.html','desktop',NULL,'2026-05-08T17:01:37.783Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('71316be1-f13d-458f-a9d6-3b56b9727746','/pages/login.html','desktop',NULL,'2026-05-08T17:09:43.284Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('9b6c1114-a48a-40a7-87d4-5a238310817b','/','desktop',NULL,'2026-05-08T17:09:45.938Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ae6ddfa0-3d97-4827-8e3e-22ccd64b97c7','/pages/login.html','desktop',NULL,'2026-05-08T17:09:48.641Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('65c6f31c-c6ce-452e-bb14-85721d6dfff0','/pages/2fa.html','desktop',NULL,'2026-05-08T17:09:55.823Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c88d4ae6-35e2-4a14-bb1a-f8b4c7cc64c5','/pages/login.html','desktop',NULL,'2026-05-08T17:15:13.228Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('fa0f399f-9e64-4da9-88c7-ee8a4b973015','/pages/2fa.html','desktop',NULL,'2026-05-08T17:15:20.066Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('779fd423-c14b-4ab1-bb73-44522b7b74f6','/pages/login.html','desktop',NULL,'2026-05-08T17:42:08.976Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('77fc8dd0-7c88-4332-816b-3f31a4fe04d5','/','desktop',NULL,'2026-05-08T17:43:24.323Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c56e1d84-c9e6-449e-ad9a-d83821ac8b72','/pages/planos.html','desktop',NULL,'2026-05-08T17:43:35.989Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e831a785-fc14-488b-bd5f-7c9ed0726241','/pages/planos.html','desktop',NULL,'2026-05-08T17:49:36.977Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e80b8cb6-9494-4ff5-9070-8555355d4061','/pages/checkout.html','desktop',NULL,'2026-05-08T17:49:46.687Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('52af2d5c-c7c1-4e7f-966e-c607edba03a9','/','desktop',NULL,'2026-05-08T18:11:09.925Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('54853763-f238-4e25-bb18-be2440b57c90','/pages/cadastro.html','desktop',NULL,'2026-05-08T18:11:25.640Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('9da7637a-510c-4d05-ab6c-f737b3ad3a14','/','desktop',NULL,'2026-05-08T18:12:16.587Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ba8a614f-5095-4db1-b0f8-25dccefa76c0','/pages/login.html','desktop',NULL,'2026-05-08T18:12:46.730Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ea91a847-ee0b-419f-9203-3a897069209c','/pages/2fa.html','desktop',NULL,'2026-05-08T18:13:15.026Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4cb94e42-e613-4946-a4a4-b0f73cd28881','/pages/admin/dashboard.html','desktop',NULL,'2026-05-08T18:13:44.715Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('94b09e7c-5ba0-4b82-9ca8-47841fc38fd4','/pages/2fa.html','desktop',NULL,'2026-05-08T18:13:56.491Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f2031375-76d4-4b98-847e-4f2c0f07aa1d','/pages/login.html','desktop',NULL,'2026-05-08T18:14:53.276Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('05c0dfe8-0a5c-4166-a621-cff5d44a9c8c','/pages/2fa.html','desktop',NULL,'2026-05-08T18:15:17.431Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c53337b1-2841-4efd-8500-4e0c2890a7f8','/pages/login.html','desktop',NULL,'2026-05-08T18:24:02.239Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('1df24202-c14d-4824-bc3f-d1f1a5557cb0','/pages/2fa.html','desktop',NULL,'2026-05-08T18:24:13.591Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('9987b3f6-cd39-416f-884d-4fa1fad1241b','/','desktop',NULL,'2026-05-09T01:04:51.215Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ec60d366-acd9-476e-9b60-4ee61bfe73fb','/pages/login.html','mobile',NULL,'2026-05-09T02:42:23.842Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8f63287f-702e-4393-a19f-2bcc8ac58c5d','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T02:42:28.856Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c654e071-aa26-43ee-a587-d88cc251cbe1','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T02:42:34.646Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e1e1156f-ce1d-4490-bdc9-2b47dbc18e6b','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T02:42:37.291Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('6b38d92e-5c28-4e26-b158-6de94efe931e','/','mobile',NULL,'2026-05-09T02:42:49.751Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('0f281e68-0258-4097-9599-50670e7752dc','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T02:42:55.621Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('96c1fe96-1d3c-4e4a-90c9-b22a794d40d6','/pages/financeiro/markdown.html','mobile',NULL,'2026-05-09T02:43:00.285Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('d64dda11-4d63-49d5-81b3-1b16361a92b8','/','mobile',NULL,'2026-05-09T02:43:16.045Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('afe9767d-50bf-495c-b536-7070d91e15e9','/pages/login.html','mobile',NULL,'2026-05-09T02:43:19.645Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('9670e2c8-c1c2-4ab0-b252-a7f721e7cc99','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T02:43:28.860Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('61d6aaf3-2bf9-4f63-9d6e-22a2fa6a4086','/pages/planos.html','mobile',NULL,'2026-05-09T02:45:53.828Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('431fe3b2-2cea-4a2d-8e70-d3c2a2290332','/pages/planos.html','mobile',NULL,'2026-05-09T02:46:04.434Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f5a1b2b1-0842-4e06-a0e4-e7af3fe6d18c','/pages/login.html','mobile',NULL,'2026-05-09T02:46:10.357Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c12f4c91-8d8d-478b-8ad7-53691f44c53a','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T02:46:25.945Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e47c4440-c846-4b96-be11-02476775c11a','/pages/login.html','mobile',NULL,'2026-05-09T02:46:32.910Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('87c2a098-4e35-4252-8e03-4fd538967167','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T02:47:35.594Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ad00649d-47dc-479a-aa75-6270198fa1fb','/pages/planos.html','mobile',NULL,'2026-05-09T02:47:55.256Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('be869764-d85d-4959-a940-d19f66a22a36','/pages/login.html','mobile',NULL,'2026-05-09T02:48:43.391Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('06a7d989-81a2-4e65-abba-ad25031d8f39','/','mobile',NULL,'2026-05-09T03:17:36.407Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e45dd297-fb50-4361-954c-4f6a39ee776f','/pages/login.html','mobile',NULL,'2026-05-09T03:17:40.100Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('44e1d513-18da-41be-ad9d-1e0389ce59fa','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T03:17:43.624Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('0067a72f-6e2c-48ec-bc1c-73cdb573c7d9','/pages/planos.html','mobile',NULL,'2026-05-09T03:17:50.329Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('12d46cc7-f65f-44ef-b78e-38c8a1ad8a35','/pages/planos.html','mobile',NULL,'2026-05-09T03:18:42.366Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('113dae6e-349e-45b9-9f3f-60b5dbc1062b','/pages/planos.html','mobile',NULL,'2026-05-09T06:03:02.184Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7abcc3a9-32e6-42c0-ab0a-88d2631ca9fc','/','mobile',NULL,'2026-05-09T06:03:15.884Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c9bec357-06ba-4b67-8431-a3fa89f335c1','/pages/login.html','mobile',NULL,'2026-05-09T06:03:19.574Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('3ddb6d56-8d99-4c26-bf80-87ad47590e76','/pages/financeiro/dashboard.html','mobile',NULL,'2026-05-09T06:03:23.563Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a7399654-a200-4c0d-9adf-a2c8544bc98a','/pages/planos.html','mobile',NULL,'2026-05-09T06:03:31.822Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('3a2d8477-25cd-4ff9-aa01-554d24b0ca60','/pages/login.html','mobile',NULL,'2026-05-09T06:03:42.133Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f6b82112-c9bf-434d-be7d-2a46e5217a1b','/','desktop',NULL,'2026-05-09T19:55:28.562Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('17595273-0323-4706-b42f-870d9de3175b','/','desktop',NULL,'2026-05-09T19:55:29.999Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('819a57db-cb69-4a0b-a565-eb93ff78b3d3','/pages/cadastro.html','mobile',NULL,'2026-05-09T22:38:35.982Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e5bdb016-b3ad-4c6f-9fa0-54bc67d668e3','/pages/vagas.html','desktop',NULL,'2026-05-11T15:30:59.450Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('96d9d502-20ac-4078-9463-b2183a29da68','/','desktop',NULL,'2026-05-11T15:47:36.915Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7bb09e78-a1d6-48cf-8994-412a2006ee90','/pages/cadastro.html','desktop',NULL,'2026-05-11T15:47:44.411Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('efd8e742-58a1-4eef-9bde-cd38ee8abb68','/','desktop',NULL,'2026-05-11T23:34:15.172Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('344c4773-5c3b-4f13-8128-3e52b31db8ef','/','desktop',NULL,'2026-05-12T16:43:18.310Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('356b6702-59af-43e4-818c-494946af7d78','/','mobile',NULL,'2026-05-12T16:43:29.862Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('bfdcc55b-1076-46dd-a764-40ee4b83b3ed','/pages/vagas.html','mobile',NULL,'2026-05-12T16:44:02.657Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('3e41b28b-6fc8-4bc8-8ec6-67420f891a59','/','mobile',NULL,'2026-05-12T16:44:17.048Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8f77f8de-0358-4bbd-8242-78c1022f57c3','/','desktop',NULL,'2026-05-12T16:45:35.242Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('6a79d6ec-6035-452d-b7da-9be8ec75fcc2','/','desktop',NULL,'2026-05-12T18:36:54.165Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('bbf27bc3-0617-4520-b451-c9d1edf7621b','/pages/cadastro.html','desktop',NULL,'2026-05-12T18:37:12.909Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('63dca0b6-5399-4d90-b094-2d47b476fa05','/pages/candidato/dashboard.html','desktop',NULL,'2026-05-12T18:37:40.720Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('aaf8e48a-74a3-44d4-bbe4-50ba6d78dffc','/pages/vagas.html','desktop',NULL,'2026-05-12T18:37:55.616Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('3a4a25f8-e30c-4b8e-b04c-5c834f8d0b37','/','desktop',NULL,'2026-05-12T18:38:11.215Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('20999a7e-f808-4af8-a459-4d7f766d8c3b','/pages/vagas.html','desktop',NULL,'2026-05-12T18:38:17.030Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a2589e7d-fa71-4d8a-bb68-334f3ec14ca6','/','desktop',NULL,'2026-05-12T18:38:20.079Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('79c7a1ee-ac69-4b01-814d-b6f39e98935d','/pages/planos.html','desktop',NULL,'2026-05-12T18:38:25.487Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ebb195c0-4f42-4485-892b-23ea8599d26c','/','mobile',NULL,'2026-05-12T19:12:16.712Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('63500957-c497-40c9-a30c-e2e5fe07191a','/','mobile',NULL,'2026-05-12T22:01:57.207Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('60795938-4e83-4a75-b7cf-9c75b92a8a5c','/','mobile',NULL,'2026-05-12T22:02:04.765Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('73758091-2a3f-41da-bbcc-6aa43eee8e22','/','desktop',NULL,'2026-05-13T02:28:16.903Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('bda0b660-d51a-4246-b0a1-c5c44c3849ef','/','desktop',NULL,'2026-05-14T07:42:45.351Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('7ad667d9-4280-4d26-92d2-681e05a118d9','/','desktop',NULL,'2026-05-14T18:00:05.306Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('47f106ee-a629-4e39-93ff-bde632bd379c','/','desktop',NULL,'2026-05-16T19:54:53.353Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('b6c58f51-c3bf-4d41-82a5-46cb51f2baec','/','desktop',NULL,'2026-05-16T20:44:48.061Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('73d483fd-11f9-43c0-8075-c64a9236ac9b','/','desktop',NULL,'2026-05-16T20:44:48.335Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('c15dd756-b6df-4e72-b1d1-8117261b4123','/','mobile',NULL,'2026-05-16T22:05:09.361Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('53919e75-d0cb-4a5b-816f-4783592244e4','/','desktop',NULL,'2026-05-16T22:05:09.691Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('dc2a8891-16e3-46f6-b687-c5e882f8a8ec','/','desktop',NULL,'2026-05-18T23:05:34.974Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('9f46a5f1-7648-4a34-b2f2-039e58bf4538','/','mobile',NULL,'2026-05-19T15:03:03.150Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('5c048bf3-cb7f-49b9-b852-bc861cfc0bbb','/','desktop',NULL,'2026-05-19T21:10:28.581Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4bc5ae06-bfe9-4234-9c46-5bf00c6b9fbe','/','desktop',NULL,'2026-05-21T23:38:38.277Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('31819393-0528-4150-9350-02e553ec5f41','/','mobile',NULL,'2026-05-23T02:25:35.978Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('46d93c91-f257-460c-9e28-84f2cded9b93','/','desktop',NULL,'2026-05-24T09:04:13.102Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4ba0b437-ce6f-4874-b750-0ae46f54e80f','/','desktop',NULL,'2026-05-24T09:11:22.895Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('374b16c8-1590-412c-8b9e-b36b56a0d1d8','/','desktop',NULL,'2026-05-24T09:15:10.505Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('19193f14-58e5-43f4-8cee-77faf42999c2','/','desktop',NULL,'2026-05-24T09:15:14.043Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('122a8a82-34a4-4367-975b-34bdcf8df9c0','/','desktop',NULL,'2026-05-25T06:56:23.300Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('e12eb1ae-2a65-4840-ac7f-a434c2e6f33b','/','desktop',NULL,'2026-05-29T01:35:20.395Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8399d42d-7f4c-42a8-a688-b835934c1872','/','desktop',NULL,'2026-05-29T01:43:10.614Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('04991104-5fca-4063-a5dd-ddf7794e3323','/','desktop',NULL,'2026-05-29T08:54:49.458Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('2eb45d9f-7709-48ba-84ff-e502528899a7','/','desktop',NULL,'2026-05-31T03:20:07.339Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('a71f1bfe-d2c7-49a6-9c65-4e6720b5dc28','/','mobile',NULL,'2026-05-31T03:20:07.654Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('027cbc26-58cd-4e4a-ad02-f28351e11b3a','/','mobile',NULL,'2026-05-31T21:41:19.603Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('f14e32df-15d9-4e97-8acf-49cebd1789c2','/','desktop',NULL,'2026-06-01T07:37:34.486Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('93fd43f4-975f-4532-9e15-3fcfd9170652','/','mobile',NULL,'2026-06-02T18:50:21.966Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('588a95c2-8c86-473b-b79c-4e44382e6fe1','/pages/login.html','mobile',NULL,'2026-06-02T18:50:37.270Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4a13afa8-efe4-4ced-a880-256ef83cad69','/pages/financeiro/dashboard.html','mobile',NULL,'2026-06-02T18:50:41.024Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8abcd8f7-f5cc-4bed-8437-68e8436f30db','/pages/financeiro/markdown.html','mobile',NULL,'2026-06-02T18:52:37.428Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('4bb26027-1085-400e-a8e4-25f3ff22d8c2','/pages/financeiro/dashboard.html','mobile',NULL,'2026-06-02T18:52:42.375Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('208e0486-0e22-4a16-bccc-8b6ded79e3db','/pages/financeiro/docs.html','mobile',NULL,'2026-06-02T18:52:44.375Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('40f84b8f-1fd7-4e38-85df-d305f4f35f72','/pages/login.html','mobile',NULL,'2026-06-02T18:53:12.766Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ee17c0be-a5f2-47a3-b85a-2a0da41b9674','/','desktop',NULL,'2026-06-03T20:05:20.344Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('ecbd454e-066e-48c7-b071-9be20ea82ad7','/','desktop',NULL,'2026-06-06T20:18:29.367Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('8d5c834b-0381-46d0-9f22-182f5346a1a5','/','mobile',NULL,'2026-06-12T03:24:41.081Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('69628c92-d760-4d19-8911-06596280e586','/','desktop',NULL,'2026-06-12T03:24:41.428Z');
INSERT INTO page_views ("id","page","device","user_id","created_at") VALUES ('06f8dd8c-c101-4c1f-a985-4772e6692f8c','/','desktop',NULL,'2026-06-14T23:31:15.666Z');
-- 245 registros

-- comunicados: vazio

DELETE FROM password_resets;
INSERT INTO password_resets ("id","user_id","token","expires_at","used","created_at") VALUES ('fa8eeb52-ec2f-45c9-bcfd-10421f43d4df','6d1066a9-8453-44d5-923b-de56cd0051ce','d20e6c1f5740f1a8ae028a3d4b3eea4e9e1ca34e04b6d4aa32c52a5097539824','2026-05-02T23:48:05.014Z',false,'2026-05-02T22:48:05.014Z');
INSERT INTO password_resets ("id","user_id","token","expires_at","used","created_at") VALUES ('71a5447e-0f79-4e2b-8119-5336556c3910','6d1066a9-8453-44d5-923b-de56cd0051ce','9ab99448fc554d4051010f5f8b4a976bd84302897dddf43fee3006f1d53d062b','2026-05-03T00:39:22.041Z',false,'2026-05-02T23:39:22.040Z');
INSERT INTO password_resets ("id","user_id","token","expires_at","used","created_at") VALUES ('ae8e4ec5-09c0-44ca-8b09-115fbc03c8e8','6d1066a9-8453-44d5-923b-de56cd0051ce','b936977c39efc7d8eea1a93c2eac1934959ae931549d04c065201dbf729eba52','2026-05-02T21:59:11.513Z',false,'2026-05-02T23:59:12.344Z');
-- 3 registros

DELETE FROM email_otp;
INSERT INTO email_otp ("id","user_id","code","expires_at","used","created_at") VALUES ('e9a482bc-1409-458a-acdf-81d5837e57e4','e0d9f69b-56aa-4b42-8de6-3ae3bab0ec7e','765689','2026-05-08T18:25:10.949Z',false,'2026-05-08T18:15:10.949Z');
INSERT INTO email_otp ("id","user_id","code","expires_at","used","created_at") VALUES ('5a1d58af-ce53-402f-b2e2-308b7a42ef54','3472d774-bfb5-4d50-855c-68397f4b371c','467646','2026-05-08T18:34:10.634Z',false,'2026-05-08T18:24:10.634Z');
-- 2 registros

SET session_replication_role = DEFAULT;
