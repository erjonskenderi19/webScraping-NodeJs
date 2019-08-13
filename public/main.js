$("#submit_search").submit(function(event) {
  event.preventDefault(); //prevent default action
  var post_url = $(this).attr("action"); //get form action url
  var request_method = $(this).attr("method"); //get form GET/POST method
  var form_data = $(this).serialize(); //Encode form elements for submission

  $.ajax({
    url: post_url,
    type: request_method,
    data: form_data
  }).done(function(response) {
    $("#table tbody tr").remove();
    $("#submit_search")
      .find("#company_searched")
      .val("");
    console.log(response);
    $.each(JSON.parse(response), function(index, obj) {
      console.log(obj);
      if (obj && obj.hasOwnProperty('error')) {
        $(".emptySearch").append(obj.error);
      } else {
        if (obj !== null && $.trim(obj.name)) {
          $("#table tbody").append(
            "<tr><td>" +
              obj.name +
              "</td>" +
              "<td>" +
              obj.number +
              "</td>" +
              "<td>" +
              obj.revenue +
              "</td>" +
              "<td>" +
              obj.register +
              "</td>" +
              "<td>" +
              obj.address +
              "</td>" +
              "<td>" +
              obj.telefon +
              "</td></tr>"
          );
          $(".emptySearch").remove();
        }
      }
    });
  });
});
