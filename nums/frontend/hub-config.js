// Ссылка "← EXIM Search" в шапке. По умолчанию используется тот же хост,
// с которого открыта страница, и порт 8080 (стандартный порт EXIM Search).
// Отредактируйте (или подмените этот файл через bind-mount), если EXIM
// Search развёрнут на другом домене/порту — см. hub/README.md.
window.EXIM_HUB_URL = window.location.protocol + "//" + window.location.hostname + ":8080";
