-- Mémo SSIAP : table des signalements (à exécuter une fois dans Supabase : SQL Editor).
create table if not exists public.signalements (
  id text primary key,
  appareil text not null,
  prenom text not null check (char_length(prenom) between 2 and 30),
  nom text not null check (char_length(nom) between 2 and 30),
  type text not null,
  page text,
  adresse text,
  texte text not null check (char_length(texte) between 10 and 1500),
  source text,
  tech jsonb,
  version text,
  date timestamptz not null default now(),
  etat text not null default 'recu' check (etat in ('recu','confirme','corrige','refuse')),
  reponse text,
  corrige_en text
);
alter table public.signalements enable row level security;
-- Tout le monde peut envoyer un signalement (clé publique), mais seulement à l'état « reçu ».
create policy "envoyer" on public.signalements for insert to anon with check (etat = 'recu');
-- Chaque appareil ne lit que ses propres signalements (en-tête x-appareil).
create policy "lire les siens" on public.signalements for select to anon
  using (appareil = coalesce(current_setting('request.headers', true)::json ->> 'x-appareil', ''));
-- Le développeur (compte connecté) lit et traite tout.
create policy "dev lit" on public.signalements for select to authenticated using (true);
create policy "dev traite" on public.signalements for update to authenticated using (true) with check (true);
create policy "dev supprime" on public.signalements for delete to authenticated using (true);
