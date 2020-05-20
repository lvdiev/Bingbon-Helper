let pageUrl = document.location.href;
console.log(`Winter is coming to ${pageUrl}!`);

main();

function main() {

    try {
        //only support Vietnamese and English
        if (! /(bingbon[.]pro[/])(en-us|vi-vn)[/](trade)/gs.test(pageUrl)) return;

        setCalutationTimer();
        setVstOpacityTimer();

    } catch (error) {
        console.log("error", error);
    }
}

function setCalutationTimer() {
    setInterval(() => {
        let symbolEl = $("div.trading-top>.symbol-name")[0];
        let priceEl = $("div.meta>.price.short, div.meta>.price.long")[0];

        if (!symbolEl || !priceEl) return;

        // console.log("price", priceEl.innerText);
        document.title = `${(priceEl || {}).innerText} | ${(symbolEl || {}).innerText}`;

        let price = Number.parseFloat(priceEl.innerText);

        let currentPriceEl = $("#form_list > li:nth-child(12) > div>span")[0];
        if (!currentPriceEl) return;

        // console.log("current", currentPriceEl);

        let sliceStart = pageUrl.indexOf("vi-vn") > -1 ? 23 : 24;

        let currentPrice = Number.parseFloat(currentPriceEl.innerText.slice(sliceStart));

        // console.log("spread", price - currentPrice);

        let text = "LONG";

        let orderBtn = $(".content_order.orderPanel.green_common_color>.footer>.order_btn")[0];

        if (!orderBtn) {
            orderBtn = $(".content_order.orderPanel.red_common_color>.footer>.order_btn")[0];
            text = "SHORT";
        }

        if (!orderBtn) return;
        orderBtn.innerText = `${text} (spread = ${Math.abs(price - currentPrice).toFixed(4)})`;

    }, 300);
}

function setVstOpacityTimer() {
    setInterval(() => {
        let rowEls = $("table.table tbody tr");
        if (!rowEls.length) return;

        // console.log("rows", rowEls);	

        for (let i = 0; i < rowEls.length; i++) {
            // console.log(i, rowEls[i]);	
            if (rowEls[i].innerText.indexOf("VST") < 0) continue;

            // rowEls[i].style.display = "none";
            $(rowEls[i]).addClass("vst-history");
        }

        countTrigger();
        countHoldingOrder()
    }, 1000)
}

async function countTrigger() {
    let triggerBtn = $("#app > div > div.bottom.flex > div.holding_panel > ul > li:nth-child(2)")[0];
    const res = await getTriggerList();
    const count = res.data && res.data.resultSize;
    // console.log("res", count);

    triggerBtn.innerText = count ? `Trigger (${count})` : "Trigger";
}

async function countHoldingOrder() {
    let holdingBtn = $("#app > div > div.bottom.flex > div.holding_panel > ul > li:nth-child(1)")[0];
    const res = await getHoldingOrderList();
    const count = res.data && res.data.orders && res.data.orders.length;
    // console.log("res", count);

    holdingBtn.innerText = count ? `My Position (${count})` : "My Position";
}

///libs

async function getHoldingOrderList() {
    const res = await fetch("https://api-cb.qpyx.xyz/api/v1/contract/order/hold?fundType=1&pagingSize=10&pageId=0", {
        "method": "GET",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "authorization": API_TOKEN,
            "content-type": "application/json",
        },
    });

    return await res.json();
}
async function getTriggerList() {
    const res = await fetch("https://api-cb.qpyx.xyz/api/v1/contract/order/delegation/list?fundType=1&pagingSize=10&pageId=0&statusList=0", {
        "method": "GET",
        "headers": {
            "accept": "application/json, text/plain, */*",
            "authorization": API_TOKEN,
            "content-type": "application/json",
        },
    });

    return await res.json();
}