var oldOpcionesPago = 0;
var nroPlanillaN = 0;


$(document).ready(function() {
    
    $(".contenedorDerechaTop").hide();
    $(".contenedorConta").css("width", "1178px");

    $(".auto").autoNumeric({aSign: '', aSep: '.', aDec: ',', vMin: '0', aPad: false});
    $(".msjPlanillaN").popover({trigger: 'hover', placement: 'right', title: 'Pago Planilla N', html: true, content: 'El asociado debe de pagar con <b>Planilla E</b> algunos subsistemas y con una <b>Planilla N</b> se paga la compensaciÃ³n que hace falta.'});
    $(".msjPlanillaP").popover({trigger: 'hover', placement: 'right', title: 'Pago Planilla P', html: true, content: 'El asociado pago con <b>Planilla K o Y</b> la ARL y con una <b>Planilla P</b> se paga la EPS que hace falta.'});

    $('.msjPlanillaG').hover(function () {
        nroPlanillaN = this.id;
    });
    $(".msjPlanillaG").popover({trigger: 'hover', placement: 'left', title: 'Planilla Correcion Generada.', html: true, content: function() { return 'El asociado ya tiene un proceso de <b>planilla de correcciÃ³n (N)</b> generado con #<b>' + nroPlanillaN + '</b>, por favor validar en el operador de informaciÃ³n antes de realizar el proceso de pago.'}});

    if($("#procesoPlanilla1271").val() == 1){
        functionOpcionesPago();
    }

    // - Ini - Ventana de Alert para el mensaje --
    window.old_alert = window.alert;
    window.alert = function(message, fallback){
    if(fallback){
        old_alert(message);
        return;
    }
    $(document.createElement('div'))
        .attr({title: 'MENSAJE', 'class': 'alert'})
        .html(message)
        .css('z-index', 9999)
        .dialog({
            buttons: {Aceptar: function(){$(this).dialog('close');}},
            close: function(){$(this).remove();},
            draggable    : true,
            modal        : true,
            resizable    : false,
            width        : '400',
            closeOnEscape: true,
            height       : 'auto',
            zIndex       : 10000
        });
    };
    // - Fin - Ventana de Alert para el mensaje --

    $("#mensajePeriodoCotizacion").popover({trigger: 'hover', placement: 'right', title: 'Periodo de cotizaciÃ³n:', html: true, content: 'pensiÃ³n, riesgos laborales y caja/parafiscales.'});
    $("#mensajePeriodoServicio").popover({trigger: 'hover', placement: 'right', title: 'Periodo de servicio:', html: true, content: 'salud.'});
    $("#mensajeNumeroPlanilla").popover({trigger: 'hover', placement: 'right', title: 'Planilla Base:', html: true, content: 'Numero de planilla con la cual se pago inicialmente.'});
    $("#mensajeFechaPlanilla").popover({trigger: 'hover', placement: 'right', title: 'Fecha pago:', html: true, content: 'El dia que se pago la el numero de planilla base.'});

    $("#fechaPlanillaPago").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '-4:+0',
        dateFormat: 'yy-mm-dd',
        numberOfMonths: 1,
    });

    if($("#tableListadoPlano").length > 0){

        var table = $('table.display').DataTable({
            "bInfo"         : false,
            "searching"	    : true, //ocultar el input search
            "bLengthChange" : false, //ocultar el info campo de <select>
            "bPaginate"     : false,
            "autoWidth"     : false,
            "language"      : {"zeroRecords" : "Sin registros...!!!"},
            "ordering"      : false,
            "scrollCollapse": true,
            "columnDefs"    : [{"defaultContent": "-", "targets": "_all" }],
            initComplete: function () {
                $('.dataTables_filter').css({ 'display': 'none'});
            }
        });

        $('#buscarDataTable').unbind().bind('keyup', function() {
            // table.column(3).search(this.value).draw(); //BUSCAR UNA SOLA COLUMNA
            table.search(this.value).draw();	    //BUSCAR EN TODAS LAS COLUMNAS
        });
    }

    $($("#numeroPlanillaBase").blur(function(){
        if($("#numeroPlanillaBase").val().trim() != "" && !$("#tableListadoPlano").length){
            $("#loadingImgBar").show();
            $.ajax({
                type: "POST",
                url: BASE_BAS + "/views/planillacorrecion/ajaxPlanillacorrecion.php",
                data: {
                    procesoEjecutar: 'infoPlanillaCorrecion',
                    tokenForm: $("#tokenForm").val(),
                    noPlanilla: $("#numeroPlanillaBase").val()
                },
                dataType: "html",
                error: function(){
                    alert("error peticiÃ³n ajax, intente nuevamente.");
                    $("#loadingImgBar").hide();
                },
                success: function(resultado){
                    var data = jQuery.parseJSON(resultado);
                    if(data.indExiste == 1){
                        $("#fechaPlanillaPago").val(data.fechaPlanillaPago);
                        $("#periodoCotizacion").val(data.periodoCotizacion);
                        $("#periodoServicio").val(data.periodoServicio);
                        $("#nombreSucursal").val(data.nombreSucursal);
                        $("#sucursalCodigo").val(data.sucursalCodigo);
                        $("#sucursalNombre").val(data.sucursalNombre);
                        $("#plaOpeId").val(data.plaOpeId);
                        $("#tipoPlanilla").val(data.tipoPlanilla);
                        $("#tipoPresentacion").val(data.tipoPresentacion);
                        $("#tipoAportante").val(data.tipoAportante);
                        $("#plaOpcionPago").val(data.plaOpcionPago);
                        $("#fechaPlanillaPago").attr("readonly", false);
                        $("#buscar").attr("disabled", false);
                    }else if(data.indExiste == 0){
                        $("#numeroPlanillaBase").val("");
                        $("#fechaPlanillaPago").val("");
                        $("#periodoCotizacion").val("");
                        $("#periodoServicio").val("");
                        $("#nombreSucursal").val("");
                        $("#sucursalCodigo").val("");
                        $("#sucursalNombre").val("");
                        $("#plaOpcionPago").val(0);
                        $("#plaOpeId").val("");
                        $("#tipoPlanilla").val("");
                        $("#fechaPlanillaPago").attr("readonly", true);
                        $("#buscar").attr("disabled", true);
                        alert(data.msjEnviar);
                    }
                    $("#loadingImgBar").hide();
                }
            });
        }
    }));


    $("#tableData :input").focus(function() {
        
        var idCampo = this.id;
        var registroCampo = idCampo.split("_")
        var idRegistro = registroCampo[2];
        var nombreCampo = registroCampo[0];

        if(nombreCampo != "lista"){

            var typeCampo = $("#" + idCampo).prop('type');
            
            if(typeCampo != "checkbox"){
                $("#valorAnterior").val($("#" + idCampo).val());
            }

            if(typeCampo == "text" && $("#" + idCampo).val() == 0){
                $("#" + idCampo).val("");
            }
            
        }
        
    });

    $("#tableData :input").blur(function() {

        var idCampo = this.id;
        var registroCampo = idCampo.split("_")
        var idRegistro = registroCampo[2];
        var nombreCampo = registroCampo[0];

        if(nombreCampo != "lista"){

            var typeCampo = $("#" + idCampo).prop('type');

            var rowCamposA = ".rowSelecion_" + idRegistro + "_A";
            var inpCamposA = "#" + nombreCampo + "_A";
            var valCamposA = rowCamposA + " " + inpCamposA;

            if(typeCampo == "text"){

                var valorA = parseInt($(valCamposA).val().toString().replace(/\./g,'')) || 0;
                var valorC = parseInt($("#" + idCampo).val().toString().replace(/\./g,'')) || 0;
                
                if($("#" + idCampo).val() == ""){
                    $("#" + idCampo).val($(valCamposA).val());
                }else if(valorA > valorC){
                    $("#" + idCampo).val($(valCamposA).val());
                }
            }
            
        }
        
    });

    $("#generaplano").click(function(){

        if(!$('.checkboxPrincipal').is(':checked')){
            alert("ERROR - Debe de seleccionar al menos un registro para poder generar el archivo.");
            return false;
        }
	
        if (!confirm("Esta seguro que desea Generar el Archivo plano de Correcion?")) {
            return false;
        }else{
            
	        var continuar = false;
            $(".tempHidden").remove();
	    
            $(".checkboxPrincipal").each(function () {

                if(this.checked == true){
                    
                    var idRegistro = this.id.split("_")[1];

                    if($("#afpIdAdm_C_" + idRegistro).prop('type') == "select-one" && $("#afpVlrTotal_C_" + idRegistro).val() != 0){
                        
                        // if($("#subTipoCot_C_" + idRegistro).val() != 0 && $("#subTipoCot_C_" + idRegistro).val() != 11){
                        //     alert("ERROR - Debe de seleccionar el Subtipo Cotizante en 0.");
                        //     continuar = false;
                        //     return false;
                        // }

                        if($("#afpIdAdm_C_" + idRegistro).val() == ""){
                            alert("ERROR - Debe de seleccionar un Administradora de AFP.");
                            continuar = false;
                            return false;
                        }

                        if($("#afpDias_C_" + idRegistro).val() == 0){
                            alert("ERROR - Debe de ingresar los dias a cotizar de AFP.");
                            continuar = false;
                            return false;
                        }

                        if($("#afpTarifa_C_" + idRegistro).val() == 0){
                            alert("ERROR - Debe de seleccionar la tarifa de AFP.");
                            continuar = false;
                            return false;
                        }

                    }

                    var tipoDatoING    = $("#novING_C_" + idRegistro).prop('type');
                    if(tipoDatoING == "checkbox"){
                        var checkedING = ($("#novING_C_" + idRegistro).prop('checked')) ? "X" : "";
                    }else{
                        var checkedING = $("#novING_C_" + idRegistro).val();
                    }

                    var tipoDatoRET    = $("#novRET_C_" + idRegistro).prop('type');
                    if(tipoDatoRET == "checkbox"){
                        var checkedRET = ($("#novRET_C_" + idRegistro).prop('checked')) ? "X" : "";
                    }else{
                        var checkedRET = $("#novRET_C_" + idRegistro).val();
                    }
                    
                    var camposTipoC = "";
                    camposTipoC += parseInt($("#subTipoCot_C_" + idRegistro).val()) + "|";
                    camposTipoC += checkedING + "|";
                    camposTipoC += checkedRET + "|";
                    camposTipoC += parseInt($("#vlrIBC_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#afpIdAdm_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#afpDias_C_" + idRegistro).val()) + "|";
                    camposTipoC += parseInt($("#afpSalario_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#afpTarifa_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#afpCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += parseInt($("#afpApoFondo_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += parseInt($("#afpCotFondo_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += parseInt($("#afpFonSolidaridad_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += parseInt($("#afpFonSubsistencia_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += parseInt($("#afpVlrTotal_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#epsIdAdm_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#epsDias_C_" + idRegistro).val()) + "|";
                    camposTipoC += parseInt($("#epsSalario_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#epsTarifa_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#epsCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#arlIdAdm_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#arlDias_C_" + idRegistro).val()) + "|";
                    camposTipoC += parseInt($("#arlSalario_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#arlTarifa_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#arlCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#ccfIdAdm_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#ccfDias_C_" + idRegistro).val()) + "|";
                    camposTipoC += parseInt($("#ccfSalario_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#ccfTarifa_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#ccfCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#senTarifa_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#senCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#icbTarifa_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#icbCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) + "|";
                    camposTipoC += $("#arlCodigoCIIU_C_" + idRegistro).val() + "|";
                    camposTipoC += $("#proTipcId_C_" + idRegistro).val() + "|";
                    camposTipoC += $("#excento_C_" + idRegistro).val() + "|";
                    camposTipoC += parseInt($("#vlrTotalPila_" + idRegistro).val()) + "|";
                    camposTipoC += $("#subTipoCotizanteOri_" + idRegistro).val();

                    if($("#subTipoCotizanteOri_" + idRegistro).val() == 20 || $("#subTipoCotizanteOri_" + idRegistro).val() == 11 && $("#tempPlanillaERETAFP").length == 0){
                        $('<input>').attr({ type: 'hidden', class: 'tempHidden', id: 'tempPlanillaERETAFP', name: 'tempPlanillaERETAFP', value: '1'}).appendTo('form');
                    }
                    
                    $('<input>').attr({
                        type: 'hidden',
                        class: 'tempHidden',
                        name: 'tempHidden[' + idRegistro + ']',
                        value: camposTipoC
                    }).appendTo('form');
                    continuar = true;
                }
            });
            
            if(continuar){
                $.ajax({
                    type    : "POST",
                    cache   : false,
                    url     : "views/planillacorrecion/generarPlanoForm.php",
                    data    : $('#form1').serialize(),
                    success : function(data) {
                        $.fancybox({
                            'titlePosition'     : 'inline',
                            'width'             : '910',
                            'scrolling'		    : 'no',
                            'transitionIn'	    : 'fade',
                            'titleShow'		    : false,
                            'content'           : data,
                            'overlayShow'	    : true,
                            'hideOnOverlayClick': false,
                            'type'		        : 'iframe',
                            'helpers'           : {'overlay' : {'closeClick': false}},
                            'onComplete'	    : function(){
                                if($.browser.msie){
                                    $('#fancybox-frame').load(function () {
                                        $('#fancybox-content').height($(this).contents().find('div').height() + 60);
                                        $(this).contents().find('body').css('overflow', 'auto');
                                    });
                                }
                                else{
                                    $('#fancybox-frame').load(function () {
                                        $('#fancybox-content').height($(this).contents().find('div').height() + 50);
                                    });
                                }
                                $("#fancybox-wrap").css('top', '300px');
                            }
                        });
                    }
                });
            }
            
            return false;
        }
    });

    $("#nombreSucursal").change(function(){
        var sucCodigo = $("#nombreSucursal").val().split("-")[0];
        var sucNombre = $("#nombreSucursal").val().split("-")[1]
        $("#sucursalCodigo").val(sucCodigo);
        $("#sucursalNombre").val(sucNombre);
        if($("#nombreSucursal").val() == ""){
            $("#tipoPresentacion").val("U");
        }else{
            $("#tipoPresentacion").val("S");
        }
    })
    
});

function valoresCotizacion(idCampo, tipoAdm, tipoCampo = ""){

    if($("#" + idCampo).val() != $("#valorAnterior").val() && $("#" + idCampo).val() != ""){

        var idRegistro      = idCampo.split("_")[2];
        var diasCotizacion  = "";
        var valorSalario    = "";
        var valorTarifas    = "";

        if(tipoAdm == "AFP"){
            if($("#afpIdAdm_C_" + idRegistro).prop('type') == "select-one" && $("#afpTarifa_C_" + idRegistro).val() == 0){
                $("#afpTarifa_C_" + idRegistro + " option[value='0.16000000']").prop("selected", true);
            }
            diasCotizacion = "afpDias_C_" + idRegistro;
            valorTarifas   = "afpTarifa_C_" + idRegistro;
            valorSalario   = "afpSalario_C_" + idRegistro;
        }

        if(tipoAdm == "EPS" && $("#pronovSinARLoN_" + idRegistro).val() != 3){
            diasCotizacion = "epsDias_C_" + idRegistro;
            valorTarifas   = "epsTarifa_C_" + idRegistro;
            valorSalario   = "epsSalario_C_" + idRegistro;
        }else if(tipoAdm == "EPS" && $("#pronovSinARLoN_" + idRegistro).val() == 3){
            sumaRegistroTotal(idRegistro);
            return false;
        }

        if(tipoAdm == "ARL"){
            diasCotizacion = "arlDias_C_" + idRegistro;
            if($("#pronovSinARLoN_" + idRegistro).val() == 2){
                valorTarifas = "arlTarifaN_C_" + idRegistro;
            }else{
                valorTarifas = "arlTarifa_C_" + idRegistro;
            }
            valorSalario = "arlSalario_C_" + idRegistro;
        }

        if(tipoAdm == "CCF"){
            diasCotizacion = "ccfDias_C_" + idRegistro;
            valorTarifas   = "ccfTarifa_C_" + idRegistro;
            valorSalario   = "ccfSalario_C_" + idRegistro;
        }
        
        $("#loadingImgBar").show();

        $.ajax({
            type: "POST",
            url: BASE_BAS + "/views/planillacorrecion/ajaxPlanillacorrecion.php",
            data: {
                procesoEjecutar: 'infoPlanillaCotizacion',
                tokenForm: $("#tokenForm").val(),
                salrioIBC: parseInt($("#vlrIBC_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0,
                tipoBuscar: tipoAdm,
                tipoCampo: tipoCampo,
                diasCotizacion: parseInt($("#" + diasCotizacion).val()) || 0,
                valorIBC: parseInt($("#" + valorSalario).val().toString().replace(/\./g,'')) || 0,
                valorTAR: $("#" + valorTarifas).val(),
                valorExcento: $("#excento_C_" + idRegistro).val()
            },
            dataType: "html",
            error: function(){
                alert("error peticiÃ³n ajax, intente nuevamente.");
                $("#loadingImgBar").hide();
            },
            success: function(resultado){

                var data = jQuery.parseJSON(resultado);
                
                if(data.indProces == 0){
                    alert(data.msjEnviar);
                    $("#loadingImgBar").hide();
                }else{
                    var valorIBC             = formato_numero(data.valCotizacionIBC, 0, "", ".");
                    var valorCotizacion      = formato_numero(data.valCotizacion, 0, "", ".");
                    var valorTotalCotizacion = 0;
                    if(tipoAdm == "AFP"){
                        valorTotalCotizacion = parseInt(data.valCotizacion) + parseInt(data.valApoAfiFondo) + parseInt(data.valCotApoFondo);
                        $("#afpSalario_C_" + idRegistro).val(valorIBC);
                        $("#afpCotizacion_C_" + idRegistro).val(valorCotizacion);
                        $("#afpApoFondo_C_" + idRegistro).val(formato_numero(data.valApoAfiFondo, 0, "", "."));
                        $("#afpCotFondo_C_" + idRegistro).val(formato_numero(data.valCotApoFondo, 0, "", "."));
                        $("#afpFonSolidaridad_C_" + idRegistro).val(formato_numero(data.valFonSolidaridad, 0, "", "."));
                        $("#afpFonSubsistencia_C_" + idRegistro).val(formato_numero(data.valFonSubsistencia, 0, "", "."));
                        $("#afpVlrTotal_C_" + idRegistro).val(formato_numero(valorTotalCotizacion, 0, "", "."));
                    }else if(tipoAdm == "EPS"){
                        $("#epsSalario_C_" + idRegistro).val(valorIBC);
                        $("#epsCotizacion_C_" + idRegistro).val(valorCotizacion);
                    }else if(tipoAdm == "ARL"){
                        $("#arlSalario_C_" + idRegistro).val(valorIBC);
                        $("#arlCotizacion_C_" + idRegistro).val(valorCotizacion);
                    }else if(tipoAdm == "CCF"){
                        $("#ccfSalario_C_" + idRegistro).val(valorIBC);
                        $("#ccfCotizacion_C_" + idRegistro).val(valorCotizacion);
                        $("#senCotizacion_C_" + idRegistro).val(formato_numero(data.valCotizacionSENA, 0, "", "."));
                        $("#icbCotizacion_C_" + idRegistro).val(formato_numero(data.valCotizacionICBF, 0, "", "."));
                    }
                    sumaRegistroTotal(idRegistro);
                }
                
            }
        });
        
    }
    
}

function sumaRegistroTotal(idRegistro){
    var afpVlrTotal         = parseInt($("#afpVlrTotal_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0;
    var afpFonSolidaridad   = parseInt($("#afpFonSolidaridad_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0;
    var afpFonSubsistencia  = parseInt($("#afpFonSubsistencia_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0;
    var epsCotizacion       = parseInt($("#epsCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0;
    var arlCotizacion       = parseInt($("#arlCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0;
    var ccfCotizacion       = parseInt($("#ccfCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0;
    var senCotizacion       = parseInt($("#senCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0;
    var icbCotizacion       = parseInt($("#icbCotizacion_C_" + idRegistro).val().toString().replace(/\./g,'')) || 0;
    var valorTotalPla       = afpVlrTotal + afpFonSolidaridad + afpFonSubsistencia + epsCotizacion + arlCotizacion + ccfCotizacion + senCotizacion + icbCotizacion;
    $("#vlrPlanilla_C_" + idRegistro).val(formato_numero(valorTotalPla, 0, "", "."));
    valorTotalPlanilla();
}

function valorTotalPlanilla(){

    var idCampo          = 0;
    var vlrTotalPlanilla = 0;
    var vlrOld           = 0;
    var vlrNew           = 0;

    $(".checkboxPrincipal").each(function() {
        idCampo = this.id.split("_")[1];
        if($('#' + this.id).prop('checked')){
            vlrOld = 0;
            vlrNew = 0;
            if($("#subTipoCotizanteOri_" + idCampo).val() != 20){
                vlrOld = parseInt($(".rowSelecion_" + idCampo + "_A #vlrPlanilla_A").val().toString().replace(/\./g,'')) || 0;
            }
            vlrNew = parseInt($("#vlrPlanilla_C_" + idCampo).val().toString().replace(/\./g,'')) || 0;
            $("#vlrTotalPila_" + idCampo).val((vlrNew - vlrOld));
            vlrTotalPlanilla = vlrTotalPlanilla + (vlrNew - vlrOld);
        }else{
            $("#vlrTotalPila_" + idCampo).val(0);
        }
    });

    $("#subTotal").val(formato_numero(vlrTotalPlanilla, 0, "", "."));
    $("#valorSubTotal").val(vlrTotalPlanilla);
    $("#loadingImgBar").hide();
}

function seleccionPlanillaN(idChekbox, indMensaje = true){

    var idRegistro = idChekbox.split('_')[1];

    if($('#' + idChekbox).prop('checked')){
        
        $(".rowSelecion_" + idRegistro + "_A").addClass("rowSeleccion");
        $(".rowSelecion_" + idRegistro + "_C").addClass("rowSeleccion");
        $(".rowSelecion_" + idRegistro + "_A :input").addClass("rowProcess_" + idRegistro);
        $(".rowSelecion_" + idRegistro + "_C :input").addClass("rowProcess_" + idRegistro);
        $(".rowSelecion_" + idRegistro + "_C .camposDisabled").attr("disabled", false);
        $(".rowSelecion_" + idRegistro + "_A .inmovilizarDatos").removeClass("colorInmovilizarDatos");
        $(".rowSelecion_" + idRegistro + "_A .inmovilizarDatosTipIde").removeClass("colorInmovilizarDatos");
        $(".rowSelecion_" + idRegistro + "_A .inmovilizarDatos").addClass("colorSeleccionInmovilizarDatos");
        $(".rowSelecion_" + idRegistro + "_A .inmovilizarDatosTipIde").addClass("colorSeleccionInmovilizarDatos");

        if($("#pronovSinARLoN_" + idRegistro).val() == 2){
            valoresCotizacion("arlDias_C_" + idRegistro, 'ARL');
        }
        valorTotalPlanilla();
    
    }else{

        if(indMensaje){
            if(!confirm("EstÃ¡ seguro de desea quitar el registro?")){
                $("#" + idChekbox).prop("checked",true);
                return false;
            }
        }

        // - Ini - Retornamos los campos al valor original del registro A.
        $(".rowSelecion_" + idRegistro + "_C .camposDisabled").each(function() {

            var idCampos    = this.id;
            var tipoDato    = $("#" + idCampos).prop('type'); 
            var nombreCampo = idCampos.split("_")[0];
            var tipoAdm     = nombreCampo.substring(0, 3);
            
            if($("#pronovSinARLoN_" + idRegistro).val() != 6 && $("#subTipoCotizanteOri_" + idRegistro).val() != 20){

                if(tipoDato == "checkbox"){
                    $("#" + idCampos).prop('checked', false);
                }else if(tipoDato == "select-one"){
                    if(nombreCampo == "afpIdAdm"){
                        $("#" + idCampos + " option[value='']").prop("selected", true);
                    }else if(nombreCampo == "epsIdAdm"){
                        if($("#pronovSinARLoN_" + idRegistro).val() != 3){
                            var valorSelect = $(".rowSelecion_" + idRegistro + "_A #" + nombreCampo + "_A").val();
                            $("#" + idCampos + " option[value='" + valorSelect + "']").prop("selected", true);
                            seleccionEPS(idRegistro, 0);
                        }
                    }else if(nombreCampo == "subTipoCot"){
                        var valorSelect = parseInt($(".rowSelecion_" + idRegistro + "_A #" + nombreCampo + "_A").val()) || 0;
                        $("#" + idCampos + " option[value='" + valorSelect + "']").prop("selected", true);
                    }else if(nombreCampo == "arlTarifa"){
                        var valorSelect = parseInt($(".rowSelecion_" + idRegistro + "_A #" + nombreCampo + "_A").val()) || 0;
                        if(valorSelect != 0){
                            $("#" + idCampos + " option[value='" + valorSelect + "']").prop("selected", true);
                        }
                    }else{                    
                        var valorSelect = $(".rowSelecion_" + idRegistro + "_A #" + nombreCampo + "_A").val();
                        $("#" + idCampos + " option[value='" + valorSelect + "']").prop("selected", true);
                    }
                }else if(tipoDato == "text"){
                    if(nombreCampo == "arlCotizacion"){
                        var valorText = $(".rowSelecion_" + idRegistro + "_A #" + nombreCampo + "_A").val();
                        if(valorText != 0){
                            $("#" + idCampos).val(valorText);
                        }
                    }else if(tipoAdm == "eps"){
                        if($("#pronovSinARLoN_" + idRegistro).val() != 3){
                            var valorText = $(".rowSelecion_" + idRegistro + "_A #" + nombreCampo + "_A").val();
                            $("#" + idCampos).val(valorText);
                        }
                    }else{
                        var valorText = $(".rowSelecion_" + idRegistro + "_A #" + nombreCampo + "_A").val();
                        $("#" + idCampos).val(valorText);
                    }
                    
                }
                
            }
            
        });
        // - Fin - Retornamos los campos al valor original del registro A.

        $(".rowSelecion_" + idRegistro + "_A").removeClass("rowSeleccion");
        $(".rowSelecion_" + idRegistro + "_C").removeClass("rowSeleccion");
        $(".rowSelecion_" + idRegistro + "_A :input").removeClass("rowProcess_" + idRegistro);
        $(".rowSelecion_" + idRegistro + "_C :input").removeClass("rowProcess_" + idRegistro);
        $(".rowSelecion_" + idRegistro + "_C .camposDisabled").attr("disabled", true);
        $(".rowSelecion_" + idRegistro + "_A .inmovilizarDatos").addClass("colorInmovilizarDatos");
        $(".rowSelecion_" + idRegistro + "_A .inmovilizarDatosTipIde").addClass("colorInmovilizarDatos");
        $(".rowSelecion_" + idRegistro + "_A .inmovilizarDatos").removeClass("colorSeleccionInmovilizarDatos");
        $(".rowSelecion_" + idRegistro + "_A .inmovilizarDatosTipIde").removeClass("colorSeleccionInmovilizarDatos");

        valorTotalPlanilla();

    }
}

function seleccionAFP(idRegistro, tipoRegistro = 0){
    if($(".rowSelecion_" + idRegistro + "_A #afpIdAdm_A").val() != ""){
        if(tipoRegistro == 1){
            alert("Cambiar la AFP del registro C cambiara tambien el resgistro A.");
        }
        var nombreAFPCambio = $(".rowSelecion_" + idRegistro + "_C #afpIdAdm_C_" + idRegistro + " option:selected" ).text();
        $(".rowSelecion_" + idRegistro + "_A #afpIdAdm_A").val(nombreAFPCambio);
    }
}

function seleccionEPS(idRegistro, tipoRegistro = 0){
    if(tipoRegistro == 1){
        alert("Cambiar la EPS del registro C cambiara tambien el resgistro A.");
    }
    var nombreEPSCambio = $(".rowSelecion_" + idRegistro + "_C #epsIdAdm_C_" + idRegistro + " option:selected" ).text();
    $(".rowSelecion_" + idRegistro + "_A #epsDesAdm_A").val(nombreEPSCambio);
}

function verCodigoCIIU(idRegistro){

	if(!$("#arlCodigoCIIU_C_" + idRegistro).attr("disabled")){

		if($("#arlCodigoCIIU_C_" + idRegistro).val() == ""){
			alert("Deben de seleccionar un nivel de riesgo.");
			return false;
		}

		$.fancybox({
			'href'				: BASE_BAS + "/views/empresa/codigociiu.php?tokenForm=" + $("#tokenForm").val() + "&indProceso=2&idCampoPegar=arlCodigoCIIU_C_" + idRegistro + "&ciiuRiesgo=" + $("#arlTarifa_C_" + idRegistro).val(),
			'titlePosition'		: 'inline',
			'width'			    : '950',
			'height'		    : '560',
			'autoSize'		    : false,
			'scrolling'		    : 'no',
			'transitionIn'		: 'fade',
			'titleShow'		    : false,
			'overlayShow'		: true,
			'hideOnOverlayClick': false,
			'type'			    : 'iframe',
			'iframe'		    : {'scrolling': 'no'},
			'onComplete'		: function(){
				if($.browser.msie){
					$('#fancybox-frame').load(function () {
						$('#fancybox-content').height($(this).contents().find('div').height() + 60);
						$(this).contents().find('body').css('overflow', 'auto');
					});
				}
				else{
					$('#fancybox-frame').load(function () {
						$('#fancybox-content').height($(this).contents().find('div').height() + 50);
					});
				}
				$("#fancybox-wrap").css('top', '300px');
			}
		});

	}

}

function functionOpcionesPago(){

    $("#tableListadoPlano .checkboxPrincipal").prop('checked', false);

    if($("#procesoPlanilla1271").val() == 1){
        $("#opcionesPago option[value='3']").prop("selected", true);    
    }
    
    if($("#opcionesPago").val() == 3){
        functionCondicionN();
    }else{
        $('.condicionPanillaN').each(function(){
            var idChekbox = this.value.split("|")[0];
            seleccionPlanillaN("lista_" + $("#lista_" + idChekbox).val(), false);
        });
    }
    
    oldOpcionesPago = $("#opcionesPago").val();
    
}

function functionCondicionN(){
    $('.condicionPanillaN').each(function(){
        var idChekbox = this.value.split("|")[0];
        var valCampo = this.value.split("|")[1];
        if($("#lista_" + idChekbox).attr("disabled") == undefined){
            if(!$("#lista_" + idChekbox).prop('checked') && valCampo == 1){
                $("#lista_" + idChekbox).prop('checked', true);
                seleccionPlanillaN("lista_" + $("#lista_" + idChekbox).val());
            }else if($("#lista_" + idChekbox).prop('checked') && valCampo == 0){
                $("#lista_" + idChekbox).prop('checked', false);
            }
        }
    });
}