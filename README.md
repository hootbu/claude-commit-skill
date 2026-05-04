<div align="center">

# claude-commit-skill

**Intelligent Conventional Commits for Claude Code, in one command.**

[![npm version](https://img.shields.io/npm/v/@hootbu/commit-skill?color=cb3837&logo=npm&label=npm)](https://www.npmjs.com/package/@hootbu/commit-skill)
[![npm downloads](https://img.shields.io/npm/dm/@hootbu/commit-skill?color=informational)](https://www.npmjs.com/package/@hootbu/commit-skill)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-skill-d97757)](https://claude.com/claude-code)
[![GitHub stars](https://img.shields.io/github/stars/hootbu/claude-commit-skill?logo=github&color=222)](https://github.com/hootbu/claude-commit-skill/stargazers)

[English](#english) · [Türkçe](#türkçe)

</div>

---

## English

### Install in one line

```bash
npx @hootbu/commit-skill
```

Restart Claude Code. From any project, just type `/commit`.

### What it does

When you run `/commit`, the skill:

- Reads your staged or unstaged diff
- Picks a Conventional Commit type and scope
- Writes a precise subject + bullet body
- Detects breaking changes and adds the `!` marker + `BREAKING CHANGE:` footer
- Extracts issue refs from your branch name (`Closes #123`, `Refs: PROJ-456`)
- Optionally pushes to origin — and **prints the target branch first** so you don't slip into `main` by accident

If you have multiple unrelated changes, it splits them into separate commits and asks for confirmation before executing.

### Commands

| Command | Behavior |
|---------|----------|
| `/commit` | Staged → single commit. Nothing staged → batch mode. |
| `/commit --all` | Force batch mode: split into multiple logical commits |
| `/commit --push` | Commit, then auto-push to origin |
| `/commit -tr` | Turkish messages |
| `/commit -en` | English messages (default) |
| `/commit --help` / `-h` | Show this table |

Flags compose freely: `/commit --all --push -tr`

### Example

**Single commit:**

```
feat(auth): add token refresh logic for expired sessions

- add automatic retry when access token returns 401
- store refresh token in secure storage instead of shared prefs
- remove manual logout on token expiry, replace with silent refresh

Closes #234
```

**Batch mode preview:**

```
Proposed commits:

1. feat(wizard): add discount calculation to pricing step
   - src/components/wizard/PricingStep.tsx
   - src/lib/pricing.ts

2. fix(db): correct meeting balance view
   - supabase/migrations/20250102_fix_balance.sql

3. chore: update dependencies
   - package.json
   - package-lock.json

Proceed with these commits? (y/n)
```

### Why people use it

- **No more vague messages.** "fix stuff", "update code" never happen again — every commit follows the same format.
- **Diff reading is automated.** You think about the change; the skill reads the diff and writes the message.
- **Clean, reviewable history.** Batch mode splits unrelated changes into separate commits instead of dumping them in one.
- **Safe push.** Target branch is announced before any push, so accidental `main` pushes don't happen silently.
- **Multilingual.** English and Turkish out of the box; the `type(scope):` prefix always stays in English per the Conventional Commits standard.

### Manual install

```bash
git clone https://github.com/hootbu/claude-commit-skill.git
mkdir -p ~/.claude/skills/commit
cp -r claude-commit-skill/SKILL.md claude-commit-skill/references ~/.claude/skills/commit/
```

### How batch grouping works

A 5-phase algorithm — affinity pairing, directory clustering, semantic separation, balancing, ordering. Full spec in [`references/grouping-algorithm.md`](references/grouping-algorithm.md).

### Contributing

Issues and PRs welcome. The skill is pure Markdown — `SKILL.md` is the spec Claude Code reads at runtime, no build step required. If you build a similar skill or extend this one, open an issue, I'd love to hear about it.

### License

[MIT](LICENSE)

---

## Türkçe

### Tek komutla kurulum

```bash
npx @hootbu/commit-skill
```

Claude Code'u yeniden başlat. Herhangi bir projede `/commit` yaz, hazır.

### Ne yapıyor

`/commit` yazdığında skill:

- Staged veya unstaged diff'ini okur
- Conventional Commit type ve scope seçer
- Net bir subject + madde işaretli body yazar
- Breaking change'leri tespit eder, `!` işaretini ve `BREAKING CHANGE:` footer'ını ekler
- Branch adından issue ref'leri çıkarır (`Closes #123`, `Refs: PROJ-456`)
- İsteğe bağlı push yapar — ve **önce hedef branch'i ekrana yazar**, böylece yanlışlıkla `main`'e push'lamazsın

Birbirinden bağımsız birden fazla değişiklik varsa onları ayrı commit'lere böler ve her biri için önce onay ister.

### Komutlar

| Komut | Davranış |
|-------|----------|
| `/commit` | Staged varsa tek commit. Yoksa batch mode. |
| `/commit --all` | Batch mode'u zorla: çoklu mantıksal commit'lere böl |
| `/commit --push` | Commit + otomatik push (origin'e) |
| `/commit -tr` | Türkçe mesaj |
| `/commit -en` | İngilizce (varsayılan) |
| `/commit --help` / `-h` | Bu tabloyu göster |

Flag'ler özgürce birleşir: `/commit --all --push -tr`

### Örnek

**Tek commit:**

```
feat(auth): expired session'lar için token refresh ekle

- access token 401 dönerse otomatik retry yap
- refresh token'ı shared prefs yerine secure storage'a koy
- token expiry'de manuel logout'u kaldır, silent refresh kullan

Closes #234
```

**Batch mode önizleme:**

```
Önerilen commit'ler:

1. feat(wizard): pricing step'e indirim hesaplaması ekle
   - src/components/wizard/PricingStep.tsx
   - src/lib/pricing.ts

2. fix(db): meeting balance view'ını düzelt
   - supabase/migrations/20250102_fix_balance.sql

3. chore: bağımlılıkları güncelle
   - package.json
   - package-lock.json

Bu commit'lerle devam edilsin mi? (y/n)
```

### Neden tercih ediliyor

- **Belirsiz mesajlar bitti.** "fix stuff", "update code" gibi mesajlar artık yok — her commit aynı formatı takip eder.
- **Diff okuma otomatik.** Sen değişikliği düşün, skill diff'i okuyup mesajı yazsın.
- **Temiz, review edilebilir history.** Batch mode bağımsız değişiklikleri tek commit'e tıkmak yerine ayrı commit'lere böler.
- **Güvenli push.** Push'tan önce hedef branch ekrana yazılır — `main`'e kazara push sessizce olmaz.
- **Çok dilli.** EN/TR varsayılan olarak destekleniyor; `type(scope):` prefix'i Conventional Commits standardı gereği her zaman İngilizce kalır.

### Manuel kurulum

```bash
git clone https://github.com/hootbu/claude-commit-skill.git
mkdir -p ~/.claude/skills/commit
cp -r claude-commit-skill/SKILL.md claude-commit-skill/references ~/.claude/skills/commit/
```

### Batch grouping nasıl çalışır

5 fazlı algoritma — yakınlık eşleşmesi, dizin kümeleme, semantik ayrım, dengeleme, sıralama. Tam spesifikasyon: [`references/grouping-algorithm.md`](references/grouping-algorithm.md).

### Katkıda bulunma

Issue ve PR'lar memnuniyetle. Skill tamamen Markdown ile yazılmış — `SKILL.md` Claude Code'un çalışma anında okuduğu spec'tir, build adımı yok. Benzer bir skill yapıyorsan veya bunu genişletiyorsan, issue aç, görmek isterim.

### Lisans

[MIT](LICENSE)
