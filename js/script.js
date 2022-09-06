let data;

let updatedData = JSON.parse(localStorage.getItem("new_data"));

let id;

const editInvoiceForm = new bootstrap.Offcanvas($("#edit-invoice"));
const newInvoiceForm = new bootstrap.Offcanvas($("#new-invoice"));

let status = "";




$(".theme-switch").on("click", function () {
    $("body").toggleClass("dark");
});

$(".filter").on("click", function () {
    $(".filter-dropdown").fadeToggle(200);
});

$(".filter-dropdown div").on("click", function () {
    let status = $(this).find("span").attr("id");
    if ($(this).hasClass("clicked")) {
        $(this).removeClass("clicked");
        showInvoices(data, 'pending,draft,paid');
    } else {
        $(".filter-dropdown div").removeClass("clicked");
        $(this).addClass("clicked");
        showInvoices(data, status);

    }
});

function getData(filter = 'pending,draft,paid', id) {
    $.getJSON("/data/data.json")
        .done(function (result) {
            data = result;
            showInvoices(data, filter);

        })
        .fail(function () {
            $(".empty").show();
        })
}

if(updatedData){
    data = updatedData;
    showInvoices(data, 'pending,draft,paid');
}else{
    getData();
}



function showInvoices(invoices, filter) {

    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let count = 0;

    $(".invoice").remove();
    $(".main-footer").removeClass("show");

    for (let invoice of invoices) {
        if (count === 0) {
            $(".invoices-num p").text(`No invoices`);
        }

        if (filter.includes(invoice.status)) {
            count++;

            if (filter === "pending,draft,paid") {
                $(".invoices-num p").text(`There are ${count} invoices`);
            } else if (count === 1) {
                $(".invoices-num p").text(`There is 1 ${invoice.status} invoice`);
            } else {
                $(".invoices-num p").text(`There are ${count} ${invoice.status} invoices`);
            }

            const date = new Date(invoice.paymentDue);
            const invoiceContainer = $("<div class='invoice'></div>");
            const invoiceNum = $(`<p class="single-invoice-num">#<span>${invoice.id}</span></p>`);
            const name = $(`<p class="name">${invoice.clientName}</p>`);
            const data = $(`<p class="date">${date.getDate()} ${month[date.getMonth()]} ${date.getFullYear()}</p>`);
            const total = $(`<p class="total">£ ${invoice.total.toFixed(2)}</p>`);
            const status = $(`<p class="status status-${invoice.status}">${invoice.status}</p>`);
            const button = $("<button class='open'><img src='img/icon-arrow-right.svg' alt=''></button>");

            invoiceContainer.append(invoiceNum, name, data, total, status, button);

            $("main .container").append(invoiceContainer);
        }

    }

}

function currentInvoice(invoices, id) {
    for (let invoice of invoices) {

        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const paymentDue = new Date(invoice.paymentDue);
        const createdAt = new Date(invoice.createdAt);
        if (invoice.id === id) {



            $(".invoice-nav .status").removeClass("status-draft status-pending status-paid")
            $(".invoice-nav .status").addClass("status-" + invoice.status).text(invoice.status);
            $(".invoice-info .single-invoice-num span").text(invoice.id);
            $(".description").text(invoice.description);
            $(".street").text(invoice.senderAddress.street);
            $(".city").text(invoice.senderAddress.city);
            $(".postcode").text(invoice.senderAddress.postCode);
            $(".country").text(invoice.senderAddress.country);
            $(".invoice-date").text(`${createdAt.getDate()} ${month[createdAt.getMonth()]} ${createdAt.getFullYear()}`);
            $(".payment-due").text(`${paymentDue.getDate()} ${month[paymentDue.getMonth()]} ${paymentDue.getFullYear()}`);
            $(".billing-address .street").text(invoice.clientAddress.street);
            $(".billing-address .city").text(invoice.clientAddress.city);
            $(".billing-address .postcode").text(invoice.clientAddress.postCode);
            $(".billing-address .country").text(invoice.clientAddress.country);
            $(".current-invoice .name").text(invoice.clientName);
            $(".email").text(invoice.clientEmail);
            $(".amount").children().not(".columns").remove();
            for (let item of invoice.items) {
                const row = $("<div class='row'></div>");
                const name = $(`<div class='col-6 col-md-5'><p>${item.name}</p></div>`);
                const total = $(`<div class='col-6 col-md-3 total'><p>£ ${ parseInt(item.total).toFixed(2)}</p></div>`);
                const quantity = $(`<div class='col-6 col-md-3 quantity'><p>${item.quantity}<span>x</span></p></div>`);
                const price = $(`<div class='col-6 col-md-2 price'><p>£ ${parseInt(item.price).toFixed(2)}</p></div>`);
                row.append(name, total, quantity, price);
                $(".amount").append(row);
            }
            $(".grand-total").text(`£ ${invoice.total.toFixed(2)}`)
            if (invoice.status === "pending") {
                $(".paid").show();
            } else {
                $(".paid").hide();
            }
            if (invoice.status === "draft") {
                $(".edit").show();
            } else {
                $(".edit").hide();
            }
        }

    }
}

function addZero(num) {
    if (num < 10) {
        return "0" + num
    } else {
        return num
    }
}

function editInvoice(invoices, id) {

    for (let invoice of invoices) {
        if (invoice.id === id) {
            const createdAt = new Date(invoice.createdAt);
            $(".edit-invoice .form-header span:nth-last-child(1)").text(id);
            $("#edit-bill-from-address").val(invoice.senderAddress.street);
            $("#edit-bill-from-city").val(invoice.senderAddress.city);
            $("#edit-bill-from-postcode").val(invoice.senderAddress.postCode);
            $("#edit-bill-from-country").val(invoice.senderAddress.country);
            $("#edit-name").val(invoice.clientName);
            $("#edit-email").val(invoice.clientEmail);
            $("#edit-bill-to-address").val(invoice.clientAddress.street);
            $("#edit-bill-to-city").val(invoice.clientAddress.city);
            $("#edit-bill-to-postcode").val(invoice.clientAddress.postCode);
            $("#edit-bill-to-coutry").val(invoice.clientAddress.country);
            $("#edit-invoice-date").val(`${addZero(createdAt.getDate())}/${addZero(createdAt.getMonth()+1)}/${createdAt.getFullYear()}`);
            $("#edit-payment-terms").val(function () {
                if (invoice.paymentTerms > 1) {
                    return `Net ${invoice.paymentTerms} Days`
                } else {
                    return `Net ${invoice.paymentTerms} Day`
                }
            }).attr("data-term", invoice.paymentTerms);
            $("#edit-project-description").val(invoice.description);

            let count = 0;

            for (let item of invoice.items) {
                count++;

                const itemContainer = $(`<div class="row item-${count}"></div>`);
                const itemName = $(`<div class="col-12 col-md-4">
                                    <label for="item-${count}-name">Item name</label>
                                    <input type="text" id="item-${count}-name" class="item-name" value="${item.name}">
                                    </div>`);
                const itemQuantity = $(`<div class="col-3 col-md-2">
                                    <label for="item-${count}-quantity">Qty.</label>
                                    <input type="text" id="item-${count}-quantity" class="item-quantity" value="${item.quantity}">
                                    </div>`);
                const itemPrice = $(`<div class="col-4 col-md-3">
                                    <label for="item-${count}-price">Price</label>
                                    <input type="text" id="item-${count}-price" class="item-price" value="${item.price}">
                                    </div>`);
                const itemTotal = $(`<div class="col-3 col-md-2">
                                    <label for="item-${count}-total">Total</label>
                                    <input type="text" id="item-${count}-total" class="item-total" value="${item.total}" readonly>
                                    </div>`);
                const deleteButton = $(`<div class="col-2 col-md-1">
                                        <button class="delete-item" type="button"><img src="img/icon-delete.svg" alt=""></button>
                                        </div>`);

                itemContainer.append(itemName, itemQuantity, itemPrice, itemTotal, deleteButton);
                $(".edit-invoice .item-list").append(itemContainer);
            }


        }
    }

}

function addItem() {
    let count = $(".edit-invoice .item-list .row").length;
    count++;
    const itemContainer = $(`<div class="row item-${count}"></div>`);
    const itemName = $(`<div class="col-12 col-md-4">
                                    <label for="item-${count}-name">Item name</label>
                                    <input type="text" id="item-${count}-name" class="item-name">
                                    </div>`);
    const itemQuantity = $(`<div class="col-3 col-md-2">
                                    <label for="item-${count}-quantity">Qty.</label>
                                    <input type="text" id="item-${count}-quantity" class="item-quantity">
                                    </div>`);
    const itemPrice = $(`<div class="col-4 col-md-3">
                                    <label for="item-${count}-price">Price</label>
                                    <input type="text" id="item-${count}-price" class="item-price">
                                    </div>`);
    const itemTotal = $(`<div class="col-3 col-md-2">
                                    <label for="item-${count}-total">Total</label>
                                    <input type="text" id="item-${count}-total" class="item-total" readonly>
                                    </div>`);
    const deleteButton = $(`<div class="col-2 col-md-1">
                                        <button class="delete-item" type="button"><img src="img/icon-delete.svg" alt=""></button>
                                        </div>`);

    itemContainer.append(itemName, itemQuantity, itemPrice, itemTotal, deleteButton);
    $(".item-list").append(itemContainer);
}

function saveInvoice(invoices, editOrNew) {
    for (let invoice of invoices) {
        if (invoice.id === id) {
            const day = $("#" + editOrNew + "-invoice-date").val().slice(0, 2);
            const month = $("#" + editOrNew + "-invoice-date").val().slice(3, 5);
            const year = $("#" + editOrNew + "-invoice-date").val().slice(6, 10);
            const date = new Date(month + "/" + day + "/" + year);


            invoice.senderAddress.street = $("#" + editOrNew + "-bill-from-address").val();
            invoice.senderAddress.city = $("#" + editOrNew + "-bill-from-city").val();
            invoice.senderAddress.postCode = $("#" + editOrNew + "-bill-from-postcode").val();
            invoice.senderAddress.country = $("#" + editOrNew + "-bill-from-country").val();
            invoice.clientName = $("#" + editOrNew + "-name").val();
            invoice.clientEmail = $("#" + editOrNew + "-email").val();
            invoice.clientAddress.street = $("#" + editOrNew + "-bill-to-address").val();
            invoice.clientAddress.city = $("#" + editOrNew + "-bill-to-city").val();
            invoice.clientAddress.postCode = $("#" + editOrNew + "-bill-to-postcode").val();
            invoice.clientAddress.country = $("#" + editOrNew + "-bill-to-country").val();
            invoice.createdAt = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
            invoice.paymentTerms = $("#" + editOrNew + "-payment-terms").attr("data-term");
            invoice.paymentDue = date.setDate(date.getDate() + parseInt(invoice.paymentTerms));
            invoice.description = $("#" + editOrNew + "-project-description").val();
            invoice.status = status;

            invoice.items = [];

            invoice.total = 0;

            $("." + editOrNew + "-invoice .item-list .row").each(function () {
                const item = {
                    "name": $(this).find(".item-name").val(),
                    "quantity": $(this).find(".item-quantity").val(),
                    "price": $(this).find(".item-price").val(),
                    "total": $(this).find(".item-total").val()
                };
                invoice.total += parseInt(item.total);
                invoice.items.push(item);
            });
        }
    }
}

function clearForm() {
    const today = new Date();
    $(".item-list .row").remove();
    $("input,label").removeClass("error");
    $(".empty-inputs").hide();
    $(".no-items").hide();
    $("input").val("");
    $('#new-invoice-date').val(`${addZero(today.getDate())}/${addZero(today.getMonth()+1)}/${today.getFullYear()}`);
    $('#new-payment-terms').attr('data-term','7').val('Net 7 Days')
    
    
}

function updateLocalStorage(){
    localStorage.clear();
    localStorage.setItem("new_data",JSON.stringify(data));
}

$("main").on("click", ".invoice", function () {

    id = $(this).find(".single-invoice-num span").text();
    $(".current-invoice").toggle();
    $(".invoice").toggle();
    $(".invoices-num,nav .navbar").toggle();
    $(".back").toggle();
    $(".main-footer").addClass("show");
    currentInvoice(data, id);

})

$(".back").on("click", function () {
    $(".current-invoice").toggle();
    $(".invoice").toggle();
    $(".invoices-num,nav .navbar").toggle();
    $(".back").toggle();
    
    showInvoices(data, 'pending,draft,paid');
})

$(".navbar .delete").on("click", function () {

    $(".modal-body span").text(id);
});

$(".modal .delete").on("click", function () {
    for (let invoice of data) {
        if (invoice.id === id) {
            data.splice(data.indexOf(invoice), 1);
        }
    }
    $(".back").click();
    $(".filter-dropdown div").removeClass("clicked")
    showInvoices(data, 'pending,draft,paid');
    updateLocalStorage();
});

$(".paid").on("click", function () {
    for (let invoice of data) {
        if (invoice.id === id) {
            invoice.status = "paid";
            $(".invoice-nav .status").removeClass("status-draft status-pending status-paid")
            $(".invoice-nav .status").addClass("status-" + invoice.status).text(invoice.status);
            $(".paid,.edit").hide();
        }
    }
    updateLocalStorage();
})

$(".edit").on("click", function () {
    clearForm();

    editInvoice(data, id);
    $(".placeholder").each(function () {
        if ($(this).prev().val()) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
    updateLocalStorage();
});

$(".new").on("click", function () {
    clearForm();
})

$(".new-item").on("click", function () {
    addItem();
});

$(".save").on("click", function () {
    const editOrNew = $(this).attr("data-form");
    status = "pending"

    let empty = 0;
    let items = $("." + editOrNew + "-invoice .item-list .row").length;
    $("." + editOrNew + "-invoice input").each(function () {
        if (!$(this).val()) {
            empty++;
            $(this).addClass("error").prev().addClass("error");
        }else{
            $(this).removeClass("error").prev().removeClass("error");
        }
    });

    if (empty < 1 && items > 0) {

        if (editOrNew != "edit") {
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let newId = "";
            for (let i = 0; i < 2; i++) {
                newId += letters[Math.floor(Math.random() * letters.length)];
            }
            for (let i = 0; i < 4; i++) {
                newId += Math.floor(Math.random() * 10);
            }
            const newInvoice = {
                "id": newId,
                "createdAt": "",
                "paymentDue": "",
                "description": "",
                "paymentTerms": "",
                "clientName": "",
                "clientEmail": "",
                "status": "",
                "senderAddress": {
                    "street": "",
                    "city": "",
                    "postCode": "",
                    "country": ""
                },
                "clientAddress": {
                    "street": "",
                    "city": "",
                    "postCode": "",
                    "country": ""
                },
                "items": [
                    {
                        "name": "",
                        "quantity": "",
                        "price": "",
                        "total": ""
      }
    ],
                "total": ""
            };
            id = newInvoice.id;
            data.push(newInvoice);
        }
        saveInvoice(data, editOrNew);
        currentInvoice(data, id);
        editInvoiceForm.hide();
        newInvoiceForm.hide();
    }
    if (empty < 1) {
        $(".empty-inputs").hide();
    } else {
        $(".empty-inputs").show();
    }
    if (items < 1) {
        $(".no-items").show();
    } else {
        $(".no-items").hide();
    }
updateLocalStorage();
});

$(".draft").on("click", function () {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    status = "draft"
    let newId = "";
    for (let i = 0; i < 2; i++) {
        newId += letters[Math.floor(Math.random() * letters.length)];
    }
    for (let i = 0; i < 4; i++) {
        newId += Math.floor(Math.random() * 10);
    }
    const newInvoice = {
        "id": newId,
        "createdAt": "",
        "paymentDue": "",
        "description": "",
        "paymentTerms": "",
        "clientName": "",
        "clientEmail": "",
        "status": status,
        "senderAddress": {
            "street": "",
            "city": "",
            "postCode": "",
            "country": ""
        },
        "clientAddress": {
            "street": "",
            "city": "",
            "postCode": "",
            "country": ""
        },
        "items": [
            {
                "name": "",
                "quantity": "",
                "price": "",
                "total": ""
      }
    ],
        "total": ""
    };
    id = newInvoice.id;
    data.push(newInvoice);
    saveInvoice(data, "new");
    showInvoices(data, 'pending,draft,paid');
    editInvoiceForm.hide();
    newInvoiceForm.hide();
    updateLocalStorage();
});

$(".edit-invoice").on("click", ".delete-item", function () {
    $(this).parentsUntil(".item-list").remove();
});

$("input").on("keydown keyup focus", function () {
    if ($(this).val()) {
        $(this).next(".placeholder").hide();
    } else {
        $(this).next(".placeholder").show();
    }
});

$("#edit-payment-terms, #new-payment-terms").on("click", function () {
    $(".payment-terms-dropdown").fadeIn(200);
});

$(".edit-invoice, .new-invoice").on("click", function (event) {


    if (event.target.className !== "payment-terms") {

        $(".payment-terms-dropdown").fadeOut(200);
    }

});

$(".payment-terms-dropdown li").on("click", function () {
    const term = $(this).find("span").text();
    $(this).parents(".payment-terms-dropdown").prevAll(".payment-terms").val(function () {
        if (term > 1) {
            return `Net ${term} Days`
        } else {
            return `Net ${term} Day`
        }
    }).attr("data-term", term);
});

$(".edit-invoice, .new-invoice").on("keydown keyup focus", ".item-quantity", function () {
    const quantity = $(this).val();
    const price = $(this).parentsUntil(".item-list").find(".item-price").val();
    $(this).parentsUntil(".item-list").find(".item-total").val((quantity * price).toFixed(2));
});

$(".edit-invoice, .new-invoice").on("keydown keyup focus", ".item-price", function () {
    const price = $(this).val();
    const quantity = $(this).parentsUntil(".item-list").find(".item-quantity").val();
    $(this).parentsUntil(".item-list").find(".item-total").val((quantity * price).toFixed(2));
});
