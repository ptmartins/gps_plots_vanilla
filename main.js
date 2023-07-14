(function () {

    /**
     * DOM object
     */
    const DOM = {};

    /**
     * Data
     */
    let data = null;

    /**
     * Show map
     */
    const showMap = () => {
        clearAppBody();
        DOM.appBody.innerHTML = 'SHOW MAP';
    };

    /**
     * Show list of observations
     */
    const showObservations = () => {
        clearAppBody();
        DOM.appBody.innerHTML = 'SHOW OBSERVATIONS';
    }

    /**
     * Show list of observations
     */
    const showDashboard = () => {
        clearAppBody();
        DOM.appBody.innerHTML = 'SHOW DASHBOARD';
    }

    /**
     * Menu pbject
     */
    const menu = {
        dashboard: {
            title: 'Dashboard',
            icon: '<fa-solid fa-gauge-high',
            cb: showDashboard
        },
        map: {
            title: 'Map',
            icon: 'fa-solid fa-map-location-dot',
            cb: showMap
        },
        observations: {
            title: 'Observations',
            icon: 'fa-solid fa-binoculars',
            cb: showObservations
        }
    };

    /**
     * Stats object
     */
    const stats = {
        totalObservations: 0,
        species: {},
        totalSpecies: 0,
        totalGroupSize: 0,
        avgGroupSize: 0
    };

    /**
     * Caches DOM elements
     */
    const cacheDOM = () => {
        DOM.loadingSpinner = document.getElementById('loading');
        DOM.navList = document.getElementById('navList');
        DOM.appHeader = document.getElementById('appHeader');
        DOM.appBody = document.getElementById('appBody');
        DOM.appFooter = document.getElementById('appFooter');
    };

    /**
     * View elements
     */
    const view = {
        appTitle: () => {
            const title = document.createElement('H2');

            title.className = 'app_title';
            title.textContent = 'GPS Plots';

            return title;
        },
        welcome: user => {
            const welcome = document.createElement('DIV');
            let _user = user ?? 'Pedro';

            welcome.className = 'app_welcome';
            welcome.textContent = `Welcome, ${_user}`;

            return welcome;
        },
        statsCard: (title, value, variation, icon) => {
            const _card = document.createElement('DIV');
            const _title = document.createElement('H3');
            const _value = document.createElement('SPAN');
            const _variation = document.createElement('SPAN');
            const _icon = document.createElement('I');

            _card.className = 'stats__card';
            _title.className = 'stats__card__title';
            _value.className = 'stats__card__value';
            _variation.className = 'stats__card__variation';
            _icon.className = 'stats__card__icon';

            _title.textContent = title;
            _value.textContent = value;

            _card.append(_title, _value);

            if (variation && !icon) {
                _variation.textContent = variation;
                _card.appendChild(_variation);
            }

            if (icon && !variation) {
                const classes = icon.split(' ');
                classes.forEach(cls => {
                    _icon.classList.add(cls);
                });
                _card.appendChild(_icon);
            }


            return _card;
        },
        menuItem: (title, cb, icon) => {
            const _item = document.createElement('LI');
            const classes = icon.split(' ');

            _item.className = 'nav__item';

            classes.forEach(cls => {
                _item.classList.add(cls);
            });

            _item.setAttribute('title', title);

            _item.addEventListener('click', ev => {
                cb();
            });

            return _item;
        }
    };

    /**
     * Renders Header section
     */
    const renderHeader = () => {
        const title = view.appTitle();
        const welcome = view.welcome();

        DOM.appHeader.append(title, welcome);
    };

    /**
     * Renders Footer section
     */
    const renderFooter = () => {
        DOM.appFooter.innerHTML = `
            <p>GPS Plots - © 2022 </p>
            <p>Developed with ♥ by <a href="https://ptmartins.gothub.io" target="_blank">Pedro Martins</a></p>
        `;
    };

    /**
     * Clears app body
     */
    const clearAppBody = () => {
        DOM.appBody.innerHTML = '';
    };

    /**
     * Renders Navigation section
     * @param {*} obj 
     */
    const renderNav = (obj) => {
        for (let item in obj) {
            const _item = view.menuItem(obj[item].title, obj[item].cb, obj[item].icon);
            DOM.navList.appendChild(_item);
        }
    };

    /**
     * Renders stats cards for homepage
     * @param {*} data 
     */
    const calcStats = data => {

        data.forEach(item => {
            stats.totalObservations += 1;
            if (stats.species[item.scientific_name]) {
                stats.species[item.scientific_name] += 1;
            } else {
                stats.species[item.scientific_name] = 1;
            }

            stats.totalGroupSize += item.group_size;
            stats.avgGroupSize = Math.round(stats.totalGroupSize / stats.totalObservations);
        });

        for (let el in stats.species) {
            stats.totalSpecies += 1;
        }

        renderStats();
    };

    /**
     * Render stats cards
     */
    renderStats = () => {
        const totalSpeciesCard = view.statsCard('Total Species', stats.totalSpecies, undefined, 'fa-solid fa-binoculars');
        const totalObservationsCard = view.statsCard('Total Observations', stats.totalObservations, undefined, 'fa-solid fa-binoculars');
        const avgGroupSizeCard = view.statsCard('Average Group Size', stats.avgGroupSize, undefined, 'fa-solid fa-binoculars');
        const statsWrapper = document.createElement('DIV');

        statsWrapper.className = 'stats__wrapper';

        statsWrapper.append(totalSpeciesCard, totalObservationsCard, avgGroupSizeCard);

        DOM.appBody.appendChild(statsWrapper);
    };

    const hideLoading = () => {
        DOM.loadingSpinner.style.display = 'none'
    }

    /**
     * Fectches data from JSON
     */
    const fetchData = async () => {
        const response = await fetch('/data/data.json');
        data = await response.json().then(data => {
            setTimeout(() => {
                hideLoading();
                calcStats(data);
            }, 1000)
        });
    };

    /**
     * Initializes app
     */
    const init = () => {
        cacheDOM();
        renderHeader();
        renderFooter();
        renderNav(menu);
        fetchData();
    };

    window.addEventListener('DOMContentLoaded', init);

})();