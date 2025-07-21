/**
 * @file
 * Gestion AJAX native pour les offres d'emploi.
 */

(function ($, Drupal, once) {

  Drupal.behaviors.lazoneJobOffersAjax = {
    attach: function (context, settings) {
      // Le formulaire des filtres
      const $exposedForm = $('#views-exposed-form-offres-enploi-ajax-page-1', context);
      
      // Le conteneur des résultats de la vue.
      const $resultsContainer = $('.view-offres-enploi-ajax .view-content', context);

      
      // Si le formulaire existe.
      if (!$exposedForm.length) {
        return;
      }
      
      console.log(" function inside ", $exposedForm);

      // Appliquer le comportement une seule fois par formulaire.
      once('lazoneJobOffersAjaxHandler', $exposedForm).forEach(function () {
          const formElement = $exposedForm; // Le DOM element du formulaire
          let currentAjaxInstance = null; // Pour gérer les requêtes AJAX concurrentes
          console.log("formElement -------> ", formElement);
          const catInput = "edit-field-categories-d-emploi-target-id-2--2";
          const subCat = "#edit-field-categories-d-emploi-target-id--2";

          const childSelect = $(subCat);
          // Initialiser le champs des sous Catégories
          childSelect.empty().append('<option value="All">-- Tout --</option>');


        /**
         * Fonction pour soumettre la requête AJAX Views.
         */
        const submitViewsAjax = function () {
            console.log('SOumission de la requete ajax.');
          // Si une requête précédente est en cours, l'annuler pour éviter les conflits.
          if (currentAjaxInstance && currentAjaxInstance.ajax) {
            currentAjaxInstance.ajax.abort();
            console.log('Ancienne requête AJAX annulée.');
          }

          // Afficher un indicateur de chargement.
          $('#ajax-loader').removeClass('hidden');

          // Récupérer les valeurs des filtres exposés
          const formDataArray = $(formElement).serializeArray();
          const submitData = {};
          formDataArray.forEach(item => {
            submitData[item.name] = item.value;
          });

          // Paramètres essentiels pour Views AJAX.
          submitData.view_name = 'offres_enploi_ajax';
          submitData.view_display_id = 'page_1';
          submitData._wrapper_format = 'drupal_ajax'; 
          submitData._drupal_ajax = 1;
          submitData.view_dom_id = "8208f20b7a03ed3f5d3ffb68fd513f3180f434c5a0473987963f6b38c23576b8";
          submitData.view_path = window.location.pathname;

          console.log('Données envoyées pour l\'AJAX Views:', submitData);

          // Créer et exécuter l'instance AJAX de Drupal.
          currentAjaxInstance = Drupal.ajax({
            url: Drupal.url('views/ajax'),
            submit: submitData,
            element: formElement, // L'élément déclencheur de l'AJAX (le formulaire)
            progress: { type: 'none' }, 
            success: function (response, status) {
              console.log('Réponse AJAX Views reçue:', response);
              $('#ajax-loader').addClass('hidden');

              $.each(response, function (index, command) {
                if (command.command === 'insert' && command.method === 'replaceWith') {
                    $resultsContainer.html(command.data);
                    console.log('Contenu de la vue mis à jour avec le HTML reçu.');
                    console.log("Nouveau contenu: -----------> ", command.data)
                }
                // Si la commande est 'replace' et qu'elle cible spécifiquement la vue
              });
              
              // Ré-attacher les comportements Drupal au nouveau contenu HTML.
              Drupal.attachBehaviors($resultsContainer[0]);
            },
            error: function (xhr, status, error) {
              console.error('Erreur lors de la requête AJAX Views:', status, error);
              $resultsContainer.removeClass('loading-results');
              $resultsContainer.html('<p class="error-message">Une erreur est survenue lors du chargement des offres.</p>');
            }
          });

          console.log("currentAjaxInstance -------------------> ", currentAjaxInstance);

          currentAjaxInstance.execute();
        };


        // --- DÉCLENCHEURS DES REQUÊTES AJAX ---

        // Écouter les changements sur tous les inputs du formulaire exposé.
        // Cela inclut les <select>, <input type="text"> (lors du "blur" ou "enter"), etc.
        console.log("formElement --------------> ", formElement);


        $(formElement).on('change', ':input', function () {
          console.log('Changement détecté sur un filtre. Exécution AJAX...');
            console.log("Laisser drupal gerer le formulaire");

            console.log("Changed element ---------> ", )

            if($(this).attr("id") === catInput) {
              const parentTid = $(this).val();

              $.ajax({
                url: '/ajax/get-subcategories/' + parentTid + '?_format=json',
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                  console.log("Loaded sub categories: ", data)
                  
                  const childSelect = $(subCat);
                  childSelect.empty().append('<option value="All">-- Tout --</option>');
                  data.forEach(item => {
                    childSelect.append(`<option value="${item.tid}">${item.name}</option>`);
                  });
                }
              });
            } else {
              $("#edit-submit-offres-enploi-ajax--2").trigger("click");
            }

            // console.log(formElement);
        });
      });
    }
  };

})(jQuery, Drupal, once);