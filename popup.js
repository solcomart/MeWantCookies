document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['cookieName', 'cookieValue', 'domain'], function(result) {
        document.querySelector('input[name="cookieName"]').value = result.cookieName || '';
        document.querySelector('input[name="cookieValue"]').value = result.cookieValue || '';
        document.querySelector('input[name="domain"]').value = result.domain || '';
    });

    document.getElementById('setCookieButton').addEventListener('click', function () {
        document.getElementById('errorAlert').innerHTML = '';
        document.getElementById('successAlert').innerHTML = '';

        var cookieName = document.querySelector('input[name="cookieName"]').value;
        var cookieValue = document.querySelector('input[name="cookieValue"]').value;
        var domain = document.querySelector('input[name="domain"]').value;

        // проверка, что поля непустые
        if (!cookieName || !cookieValue || !domain) {
            document.getElementById('errorAlert').innerHTML = 'All fields must be filled!';
            return;
        }

        // валидация домена
        var domainPattern = /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/g;
        if (!domainPattern.test(domain)) {
            document.getElementById('errorAlert').innerHTML = 'Domain is not valid!';
            return;
        }

        // запомним значения для автозаполнения полей в следующий раз
        chrome.storage.local.set({cookieName: cookieName});
        chrome.storage.local.set({cookieValue: cookieValue});
        chrome.storage.local.set({domain: domain});

        // отсчитаем 60 дней (в миллисекундах)
        var expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (60 * 24 * 60 * 60 * 1000));

        var cookieDetails = {
            url: 'https://' + domain,
            name: cookieName,
            value: cookieValue,
            expirationDate: expirationDate.getTime() / 1000,
        };

        chrome.cookies.set(cookieDetails, function(cookie) {
            if (cookie) {
                document.getElementById('successAlert').innerHTML = 'Cookies set successfully!';
            } else {
                document.getElementById('errorAlert').innerHTML = 'Something is wrong!';
            }
        });
    });
});