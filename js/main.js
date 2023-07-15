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
     * Menu pbject
     */
    const menu = {
        dashboard: {
            title: 'Dashboard',
            icon: 'fa-solid fa-gauge-high',
            path: '/dashboard'
        },
        map: {
            title: 'Map',
            icon: 'fa-solid fa-location-dot',
            path: '/map'
        },
        observations: {
            title: 'Observations',
            icon: 'fa-solid fa-table-list',
            path: '/observations'
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
        viewTitle: (txt) => {
            const title = document.createElement('H2');
            title.className = 'view__title';
            title.textContent = txt;

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
        menuItem: (title, icon, path) => {
            const _item = document.createElement('LI');
            const classes = icon.split(' ');

            _item.className = 'nav__item';

            classes.forEach(cls => {
                _item.classList.add(cls);
            });

            _item.setAttribute('title', title);
            _item.setAttribute('data-path', path);

            return _item;
        },
        listItem: (icon, date, species, groupSize, lat, long) => {
            const _listItem = document.createElement('DIV');
            const _icon = document.createElement('I');
            const _date = document.createElement('TIME');
            const _species = document.createElement('H3');
            const _groupSize = document.createElement('P');
            const _coordinates = document.createElement('DIV');
            const _lat = document.createElement('SPAN');
            const _long = document.createElement('SPAN');

            const classes = icon.split(' ');
            _icon.className = 'list__item__icon';
            classes.forEach(cls => {
                _icon.classList.add(cls);
            });

            _listItem.className = 'list__item';
            _date.className = 'list__item__date';
            _species.className = 'list__item__species';
            _groupSize.className = 'list__item__groupSize';
            _coordinates.className = 'list__item__coordinates';
            _lat.className = 'list__item__lat';
            _long.className = 'list__item__long';

            _date.textContent = date;
            _species.textContent = species;
            _groupSize.textContent = groupSize;
            _lat.textContent = lat;
            _long.textContent = long;

            _coordinates.append(_lat, _long);

            _listItem.append(_icon, _date, _species, _groupSize, _coordinates);

            return _listItem;

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
     * Show map
     */
    const showMap = data => {
        clearAppBody();
        DOM.appBody.innerHTML = 'SHOW MAP';
    };

    /**
     * Show list of observations
     */
    const showObservations = data => {
        clearAppBody();
        DOM.appBody.appendChild(view.viewTitle('Observations'));

        const table = document.createElement('DIV');
        const tableHeader = document.createElement('DIV');
        const tableBody = document.createElement('DIV');

        table.className = 'table';
        tableHeader.className = 'table__header';
        tableBody.className = 'table__body';

        for (let i = 0; i < 5; i++) {
            const headerCell = document.createElement('SPAN');

            switch (i) {
                case 0:
                    headerCell.textContent = '';
                    break;
                case 1:
                    headerCell.textContent = 'Date';
                    break;
                case 2:
                    headerCell.textContent = 'Species';
                    break;
                case 3:
                    headerCell.textContent = 'Group Size';
                    break;
                case 4:
                    headerCell.textContent = 'Coordinates';
                    break;
                default:
                    break;

            }

            tableHeader.appendChild(headerCell);
        }

        data.forEach(item => {
            console.log(item);
            const row = view.listItem('fa-solid fa-binoculars', item.date_time, item.common_name, item.group_size, item.latitude, item.longitude);
            tableBody.appendChild(row);
        })

        table.append(tableHeader, tableBody);

        DOM.appBody.appendChild(table);
    }

    /**
     * Show list of observations
     */
    const showDashboard = data => {
        clearAppBody();
        calcStats(data);
    }

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
        DOM.menuItems = [];

        for (let item in obj) {
            const _item = view.menuItem(obj[item].title, obj[item].icon, obj[item].path);
            DOM.navList.appendChild(_item);

            DOM.menuItems.push(_item);
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
        const totalSpeciesCard = view.statsCard('Total Species', stats.totalSpecies, undefined, 'fa-solid fa-hashtag');
        const totalObservationsCard = view.statsCard('Total Observations', stats.totalObservations, undefined, 'fa-solid fa-binoculars');
        const avgGroupSizeCard = view.statsCard('Average Group Size', stats.avgGroupSize, undefined, 'fa-solid fa-binoculars');
        const statsWrapper = document.createElement('DIV');

        statsWrapper.className = 'stats__wrapper';

        statsWrapper.append(totalSpeciesCard, totalObservationsCard, avgGroupSizeCard);

        DOM.appBody.appendChild(statsWrapper);
    };

    /**
     * Hide loading spinner
     */
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
                setupEvents(data);
            }, 1000)
        });
    };

    /**
     * Setup events
     */
    const setupEvents = (data) => {

        console.log(data);

        DOM.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const path = item.getAttribute('data-path');

                if (path === '/map') {
                    showMap(data);
                } else if (path === '/observations') {
                    showObservations(data);
                } else if (path === '/dashboard') {
                    showDashboard(data);
                }
            });
        })
    }

    /**
     * Render layout
     */
    const renderLayout = () => {
        renderHeader();
        renderFooter();
        renderNav(menu);
    }

    /**
     * Initializes app
     */
    const init = () => {
        cacheDOM();
        renderLayout();
        fetchData();
    };

    window.addEventListener('DOMContentLoaded', init);

})();