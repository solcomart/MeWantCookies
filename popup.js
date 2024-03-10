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

function getCookieFormValues() {
    var cookieName = document.querySelector('input[name="cookieName"]').value;
    var cookieValue = document.querySelector('input[name="cookieValue"]').value;

    var domainsArray = [];
    document.querySelectorAll('input[name="domain"]').forEach(function (input) {
        var domainValue = input.value.trim();
        if (domainValue !== '') {
            domainsArray.push(domainValue);
        }
    });

    return {
        cookieName: cookieName,
        cookieValue: cookieValue,
        domains: domainsArray,
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // выведем сохранённые действия
    chrome.storage.local.get('savedActions', function (result) {
        var savedActions = result.savedActions || false;
        console.log(savedActions)
    });

    // наполним форму прошлыми значениями
    chrome.storage.local.get(['cookieName', 'cookieValue', 'domains'], function (result) {
        document.querySelector('input[name="cookieName"]').value = result.cookieName || '';
        document.querySelector('input[name="cookieValue"]').value = result.cookieValue || '';

        var domains = result.domains || false;
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
        var setActionNameButton = document.getElementById('setActionNameButton');
        var saveActionContainer = document.getElementById('saveActionContainer');
        setActionNameButton.style.display = 'none';
        saveActionContainer.style.display = 'none';

        var values = getCookieFormValues()

        // проверка, что поля непустые
        if (!values.cookieName || !values.cookieValue || values.domains.length === 0) {
            document.getElementById('errorAlert').innerHTML = 'All fields must be filled!';
            return;
        }

        // запомним значения для автозаполнения полей в следующий раз
        chrome.storage.local.set({cookieName: values.cookieName});
        chrome.storage.local.set({cookieValue: values.cookieValue});
        chrome.storage.local.set({domains: values.domains});

        // отсчитаем 60 дней (в миллисекундах)
        var expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (60 * 24 * 60 * 60 * 1000));

        // присваиваем куку для каждого домена
        for (var i = 0; i < values.domains.length; i++) {
            var cookieDetails = {
                url: 'https://' + values.domains[i],
                name: values.cookieName,
                value: values.cookieValue,
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
            setActionNameButton.style.display = 'inline-block';
        }
    });

    // задать имя действию
    document.getElementById('setActionNameButton').addEventListener('click', function () {
        var saveActionContainer = document.getElementById('saveActionContainer');
        saveActionContainer.style.display = 'block';
    });

    // сохранить действие
    document.getElementById('saveActionButton').addEventListener('click', function () {
        var values = getCookieFormValues()
        values.actionName = document.querySelector('input[name="actionName"]').value;

        // проверка, что поля непустые
        if (!values.cookieName || !values.cookieValue || values.domains.length === 0 || !values.actionName) {
            document.getElementById('errorAlert').innerHTML = 'All fields must be filled!';
            return;
        }

        chrome.storage.local.get('savedActions', function (result) {
            var savedActions = result.savedActions || false;
            if (!Array.isArray(savedActions)) {
                savedActions = [];
            }
            savedActions.push(values);
            chrome.storage.local.set({savedActions: savedActions})
        });
    });
});