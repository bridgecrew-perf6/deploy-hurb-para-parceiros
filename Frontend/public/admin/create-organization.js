const elements = {
    inputs : document.querySelectorAll(".form-field input"),
    submit: document.querySelector("input[type='submit'][class='primary-button']")
}

let isFilled = {
    firstInput: false,
    secondInput: false,
    thirdInput: false,
    fourthInput: false,
}

function buttonStatusHandler(){

    if(isFilled.firstInput && isFilled.secondInput && isFilled.thirdInput && isFilled.fourthInput) {
        elements.submit.removeAttribute("disabled");
    } else {
        elements.submit.setAttribute("disabled","true");
    }

};

elements.inputs.forEach(input => {

    input.addEventListener("input", function(e) {

        if(input.value.length != 0) {
            switch(e.target.id) {
                case "name":
                    isFilled.firstInput = true;
                break;
                case "tel":
                    isFilled.secondInput = true;
                break;
                case "cnpj":
                    isFilled.thirdInput = true;
                break;
                case "rooms-qtd":
                    isFilled.fourthInput = true;
                break;
            }
        } else {
            switch(e.target.id) {
                case "name":
                    isFilled.firstInput = false;
                break;
                case "tel":
                    isFilled.secondInput = false;
                break;
                case "cnpj":
                    isFilled.thirdInput = false;
                break;
                case "rooms-qtd":
                    isFilled.fourthInput = false;
                break;
            }
        }
    
        buttonStatusHandler();

    });
})

// Setting up the page minimum access level.
const pageMinimumAccessLevel = 10;

// Setting up the delay function.
function delay(n){
    return new Promise(function(resolve){
        setTimeout(resolve,n*1000);
    });
}

// Setting up the notification and redirect function.
const invalidOrExpiredToken = async () => {

    document.querySelector("#loading").style.visibility = "hidden";

    toastr.error("Faça o login novamente. Redirecionando...","Token inválido ou sessão expirada");

    await delay(3);

    window.location.href = "https://hurb-para-parceiros.herokuapp.com/login.html";

}

// Checking if the user's session still valid.
$(document).ready(function() {

    if(!localStorage.getItem("token")) {
        invalidOrExpiredToken();
    } else {

        document.querySelector("#loading").style.visibility = "visible";

        var settings = {
            "url": "https://hurb-para-parceiros.herokuapp.com/api/v1/user/is-session-token-still-valid",
            "method": "GET",
            "timeout": 0,
            "headers": {
              "Authorization": localStorage.getItem("token"),
            },
            "error": invalidOrExpiredToken,
          };
          
          $.ajax(settings).done(function (response) {
            if(response.success) {

                document.querySelector("#loading").style.visibility = "hidden";

                if(response.success.data.access_level < pageMinimumAccessLevel) {
                    invalidOrExpiredToken();
                }
                
            }
          })

    }

});

let partners = [];

$(document).ready(function() {
    var settings = {
        "url": "https://hurb-para-parceiros.herokuapp.com/api/v1/partner/",
        "method": "GET",
        "timeout": 0,
        "headers": {
          "Authorization": localStorage.getItem("token"),
        },
      };
      
      $.ajax(settings).done(function (response) {
        response.success.data.forEach(partner => {

            partners.push(partner);

            let option = document.createElement("option");
            option.textContent = `${partner.nome_completo} - ${partner.cpf}`;
            option.value = `${partner.nome_completo} - ${partner.cpf}`;
            option.id = partner.id;

            document.querySelector("#responsible-partner").appendChild(option);

        })
      });
})

// Form prevent default.
$("form").submit(function(e) {
    e.preventDefault();
});

document.querySelector(".primary-button").addEventListener("click", function(){

    document.querySelector("#loading").style.visability = "visible";

    var settings = {
        "url": "https://hurb-para-parceiros.herokuapp.com/api/v1/organization/create",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Authorization": localStorage.getItem("token"),
        },
        "data": {
            partner_id: document.querySelector(`option[value='${(document.querySelector("#responsible-partner").value)}']`).id,
            name: document.querySelector('#name').value,
            telephone: document.querySelector('#tel').value,
            cnpj: document.querySelector('#cnpj').value,
            quantity_of_rooms: parseInt(document.querySelector('#rooms-qtd').value)
        }
      };
      
      $.ajax(settings).done(function (response) {

        document.querySelector('#loading').style.visability = "hidden";

            if(response.success){
                toastr.success(response.success.title);
            } else{
                toastr.error(response.error.detail, response.error.title);
            }
      });
})