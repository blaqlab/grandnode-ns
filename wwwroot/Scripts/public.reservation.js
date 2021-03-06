﻿

var Reservation = {
    availableDates: [],
    currentMonth: -1,
    currentYear: -1,
    _parameter: "",
    noReservationsMessage: "",
    productId: "",
    ajaxUrl: "",
    ajaxUrl2: "",
    startDate: "",
    startDateMonth: "",
    startDateYear: "",

    init: function init(startDate, startDateYear, startDateMonth, noReservationsMessage, ajaxUrl, productId, ajaxUrl2) {
        this.noReservationsMessage = noReservationsMessage;
        this.ajaxUrl = ajaxUrl;
        this.ajaxUrl2 = ajaxUrl2;
        this.productId = productId;
        this.startDate = startDate;
        this.startDateMonth = startDateMonth;
        this.startDateYear = startDateYear;

        this.fillAvailableDates(startDateYear, startDateMonth, Reservation._parameter, false);

        $("#reservationDatepicker").datepicker({
            onSelect: this.onDatePickerDateChange,
            firstDay: 1,
            beforeShowDay: this.daysToMark,
            onChangeMonthYear: function (year, month, inst) {
                $("#hoursDiv").html('');
                Reservation.fillAvailableDates(year, month, Reservation._parameter, false);
            },
            defaultDate: this.startDate
        }
        );

        $("#reservationDatepickerFrom").datepicker({
            firstDay: 1,
            defaultDate: this.startDate,
            onSelect: this.onDatePickerSelect
        }
        );

        $("#reservationDatepickerTo").datepicker({
            firstDay: 1,
            defaultDate: this.startDate,
            onSelect: this.onDatePickerSelect
        }
        );

        this.onDatePickerDateChange();
        var dropdown = document.getElementById("parameterDropdown");
        if (dropdown != null) {
            $("#parameterDropdown").change(function () {
                Reservation.fillAvailableDates(Reservation.currentYear, Reservation.currentMonth, this.value, true);
            });
        }
    },

    reload: function init(startDate, startDateYear, startDateMonth) {
        this.startDate = startDate;
        this.startDateMonth = startDateMonth;
        this.startDateYear = startDateYear;

        this.fillAvailableDates(startDateYear, startDateMonth, Reservation._parameter, false);

        $("#reservationDatepicker").datepicker({
            onSelect: this.onDatePickerDateChange,
            firstDay: 1,
            beforeShowDay: this.daysToMark,
            onChangeMonthYear: function (year, month, inst) {
                $("#hoursDiv").html('');
                Reservation.fillAvailableDates(year, month, Reservation._parameter, false);
            },
            defaultDate: this.startDate
        }
        );

        $("#reservationDatepickerFrom").datepicker({
            firstDay: 1,
            defaultDate: this.startDate,
            onSelect: this.onDatePickerSelect
        }
        );

        $("#reservationDatepickerTo").datepicker({
            firstDay: 1,
            defaultDate: this.startDate,
            onSelect: this.onDatePickerSelect
        }
        );

        this.onDatePickerDateChange();
        
    },

    daysToMark: function daysToMark(date) {
        for (i = 0; i < Reservation.availableDates.length; i++) {
            var splitResults = Reservation.availableDates[i].Date.split("-");
            var year = splitResults[0];
            var month = splitResults[1];
            var day = splitResults[2].substring(0, 2);

            if (date.getYear() + 1900 == year && date.getMonth() + 1 == month && date.getDate() == day) {
                return [true, '', ""];
            }
        }

        return [false, '', ""];
    },

    onDatePickerDateChange: function onDatePickerDateChange() {
        var selected = $("#reservationDatepicker").val();
        if (selected != null) {
            var selectedSplitResults = selected.split("/");
            var selectedDay = selectedSplitResults[1];
            var selectedMonth = selectedSplitResults[0];
            var selectedYear = selectedSplitResults[2];

            $("#hoursDiv").empty();
            for (i = 0; i < Reservation.availableDates.length; i++) {
                var splitResults = Reservation.availableDates[i].Date.split("-");
                var year = splitResults[0];
                var month = splitResults[1];
                var day = splitResults[2].substring(0, 2);

                if (selectedYear == year && selectedMonth == month && selectedDay == day) {
                    $("#hoursDiv").append("<label class='btn btn-secondary'><input type='radio' id='Reservation_" + Reservation.availableDates[i].Id + "' name='Reservation_" + Reservation.availableDates[i].Id + "' />" + Reservation.availableDates[i].Date.substring(11, 16) + "</label>");
                }
            }

            if (Reservation.availableDates.length == 0) {
                $("#hoursDiv").append("<label>" + Reservation.noReservationsMessage + "</label>");
            }
        }
    },

    fillAvailableDates: function fillAvailableDates(year, month, parameter, reload) {
        var postData = {
            productId: Reservation.productId,
            month: month,
            year: year,
            parameter: parameter
        };

        addAntiForgeryToken(postData);

        $.ajax({
            cache: false,
            type: "POST",
            url: Reservation.ajaxUrl,
            dataType: 'json',
            data: postData,
            async: false
        }).done(function (data) {
            Reservation.currentMonth = month;
            Reservation.currentYear = year;
            Reservation.availableDates = data;
            if (reload) {
                Reservation._parameter = parameter;
                $("#reservationDatepicker").datepicker("destroy");
                Reservation.reload(new Date(year, month-1, 1), Reservation.currentYear, Reservation.currentMonth);
                $("#reservationDatepicker").datepicker("refresh");
            }
        }).fail(function () {
            alert("Error");
        });
    },

    onDatePickerSelect: function onDatePickerSelect() {
        $.ajax({
            cache: false,
            url: Reservation.ajaxUrl2,
            data: $('#product-details-form').serialize(),
            type: 'post',
            success: function (data) {
                if (data.sku) {
                    $("#sku-" + Reservation.productId).text(data.sku);
                }
                if (data.mpn) {
                    $("#mpn-" + Reservation.productId).text(data.mpn);
                }
                if (data.gtin) {
                    $("#gtin-" + Reservation.productId).text(data.gtin);
                }
                if (data.price) {
                    $(".price-value-" + Reservation.productId).text(data.price);
                }
            }
        });
    }
}