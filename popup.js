function addDomainField(value = '') {
    var domainsContainer = document.querySelector('.domainsContainer');

    var newDomainInput = document.createElement('input');
    newDomainInput.type = 'text';
    newDomainInput.name = 'domain';
    newDomainInput.placeholder = 'Domain';
    newDomainInput.value = value;

    domainsContainer.appendChild(newDomainInput);
    domainsContainer.appendChild(document.createElement('br'));
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['cookieName', 'cookieValue', 'domains'], function (result) {
        document.querySelector('input[name="cookieName"]').value = result.cookieName || '';
        document.querySelector('input[name="cookieValue"]').value = result.cookieValue || '';

        var domains = result.domains ? JSON.parse(result.domains) : '';
        // для первого домена - заполняем имеющееся поля
        // для остальных - добавляем поля
        if (Array.isArray(domains)) {
            document.querySelector('input[name="domain"]').value = domains[0] || '';
            for (var i = 1; i < domains.length; i++) {
                addDomainField(domains[i])
            }
        }
    });

    // кнопка "Добавить домен"
    document.getElementById('addDomainButton').addEventListener('click', function () {
        addDomainField()
    });

    // запись куки по данным из формы
    document.getElementById('setCookieButton').addEventListener('click', function () {
        document.getElementById('errorAlert').innerHTML = '';
        document.getElementById('successAlert').innerHTML = '';

        var cookieName = document.querySelector('input[name="cookieName"]').value;
        var cookieValue = document.querySelector('input[name="cookieValue"]').value;

        var domainsArray = [];
        document.querySelectorAll('input[name="domain"]').forEach(function (input) {
            var domainValue = input.value.trim();
            if (domainValue !== '') {
                domainsArray.push(domainValue);
            }
        });

        // проверка, что поля непустые
        if (!cookieName || !cookieValue || domainsArray.length === 0) {
            document.getElementById('errorAlert').innerHTML = 'All fields must be filled!';
            return;
        }

        // запомним значения для автозаполнения полей в следующий раз
        chrome.storage.local.set({cookieName: cookieName});
        chrome.storage.local.set({cookieValue: cookieValue});
        chrome.storage.local.set({domains: JSON.stringify(domainsArray)});

        // отсчитаем 60 дней (в миллисекундах)
        var expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (60 * 24 * 60 * 60 * 1000));

        // присваиваем куку для каждого домена
        for (var i = 0; i < domainsArray.length; i++) {
            var cookieDetails = {
                url: 'https://' + domainsArray[i],
                name: cookieName,
                value: cookieValue,
                expirationDate: expirationDate.getTime() / 1000,
            };

            chrome.cookies.set(cookieDetails, function (cookie) {
                if (!cookie) {
                    document.getElementById('errorAlert').innerHTML = 'Something is wrong!';
                }
            });
        }

        if (document.getElementById('errorAlert').innerHTML === '') {
            document.getElementById('successAlert').innerHTML = 'Cookies set successfully!';
        }
    });
});