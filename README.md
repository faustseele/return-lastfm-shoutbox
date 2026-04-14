# Return Last.fm Shoutbox

Browser extension that brings back inline shouts on Last.fm pages. No more clicking "Join the conversation" — shoutouts appear right where they used to be.

Works on artist, album, track, and user pages. Read and write shouts without leaving the page.

<!-- keywords: lastfm last.fm last-fm shoutbox shout-box shout box shouts shoutout shout-out shout out inline shouts browser extension chrome extension firefox extension web extension addon add-on join the conversation -->

## Install

- [Chrome Web Store](#) *(coming soon)*
- [Firefox Add-ons](#) *(coming soon)*

## What it does

- **Replaces** the "Join the conversation" button with an inline shoutbox
- **Displays** recent shouts directly on the page — artist, album, track, user
- **Lets you post** shouts without navigating away (must be logged into Last.fm)
- **Loads more** shouts on demand — no infinite scroll, just a button
- **Falls back** to the original button if something goes wrong

## Permissions

Only runs on `last.fm` pages. No data collection. No tracking. Open source.

## Build from source

```bash
git clone https://github.com/faustseele/return-lastfm-shoutbox.git
cd return-lastfm-shoutbox
npm install
npm run dev        # dev mode with HMR
npm run build      # production build for Chrome
npm run build:firefox
```

## License

MIT

---

# Return Last.fm Shoutbox (RU)

Расширение для браузера, которое возвращает шаутбокс (shoutbox) на страницы Last.fm. Больше не нужно нажимать «Join the conversation» — шауты (shouts) отображаются прямо на странице, как раньше.

Работает на страницах исполнителей, альбомов, треков и пользователей. Чтение и написание шаутов без перехода на отдельную страницу.

## Установка

- [Chrome Web Store](#) *(скоро)*
- [Firefox Add-ons](#) *(скоро)*

## Что делает

- **Заменяет** кнопку «Join the conversation» на встроенный шаутбокс
- **Показывает** последние шауты прямо на странице — исполнители, альбомы, треки, пользователи
- **Позволяет писать** шауты без перехода на другую страницу (нужно быть залогиненным на Last.fm)
- **Подгружает** старые шауты по кнопке «загрузить ещё»
- **Откатывается** к оригинальной кнопке в случае ошибки

## Разрешения

Работает только на `last.fm`. Не собирает данные. Не отслеживает. Открытый исходный код.
