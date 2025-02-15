const SELECTOR = {
    
    SEARCH_INPUT: '::-p-xpath(//div[@class="searchTop"]//input[@id="searchField"])',

    CITY_LINK: ".worldContent .searchCol ul li:first-child a",

    CLOUDY_TAB: '::-p-xpath(//div[@class="tpcBlock"]//ul[@class="tpcTabs"]//li[@class="wfCloudiness"])',

    CLOUDY_IMG: '::-p-xpath(//div[@class="tpcBlock"]//div[@id="wfCloudiness"]//div[@class="wfTpc"]//div[@class="wfTpcImg"]//img)',

    CLOUDY_CONTAINER: '::-p-xpath(//div[@class="tpcBlock"]//div[@id="wfCloudiness"])',

    TIME_CONTAINER: '::-p-xpath(//div[@class="tpcBlock"]//div[@id="wfCloudiness"]//div[@class="wfTpc"])',

    TIME_ITEMS: '::-p-xpath(//div[@class="tpcBlock"]//div[@id="wfCloudiness"]//div[@class="wfTpc"]//ul//li)',

    timeItemByIndex: (index: number) => `::-p-xpath(//div[@class="tpcBlock"]//div[@id="wfCloudiness"]//div[@class="wfTpc"]//ul/li[${index}]/a)`,
};

export default SELECTOR;