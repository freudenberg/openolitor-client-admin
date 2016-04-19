'use strict';

/**
 */
angular.module('openolitor')
  .controller('RechnungenDetailController', ['$scope', '$rootScope', '$filter',
    '$routeParams', '$http',
    '$location', '$uibModal', 'gettext', 'RechnungenDetailModel',
    'EnumUtil', 'API_URL', 'msgBus', '$log', 'moment', 'KundenOverviewModel', 'AbosOverviewModel',
    function($scope, $rootScope, $filter, $routeParams, $http, $location, $uibModal,
      gettext,
      RechnungenDetailModel, EnumUtil, API_URL,
      msgBus, $log, moment, KundenOverviewModel, AbosOverviewModel) {

      var defaults = {
        model: {
          id: undefined,
          rechnungsdatum: new Date(),
          faelligkeitsdatum: moment().add(1, 'month').subtract(1, 'day').valueOf()
        }
      };

      $scope.loading = false;

      $scope.getKunden = function(filter) {
        if ($scope.loading) {
          return;
        }

        $scope.loading = true;

        return KundenOverviewModel.query({
          q: filter
        }, function() {
          $scope.loading = false;
        }).$promise.then(function(kunden) {
          return kunden;
        });
      };

      $scope.loadRechnung = function() {
        RechnungenDetailModel.get({
          id: $routeParams.id
        }, function(result) {
          $scope.rechnung = result;
        });
      };

      if (!$routeParams.id) {
        $scope.rechnung = new RechnungenDetailModel(defaults.model);
        $scope.pendenzen = [];
      } else {
        $scope.loadRechnung();
      }

      if (!$routeParams.kundeId) {
        $scope.kunde = undefined;
      } else {
        KundenOverviewModel.get({
          id: $routeParams.kundeId
        }, function(kunde) {
          $scope.kunde = kunde;
        });
      }

      if (!$routeParams.aboId) {
        $scope.abo = undefined;
      } else {
        AbosOverviewModel.get({
          id: $routeParams.aboId
        }, function(abo) {
          $scope.abo = abo;
        });
      }

      $scope.loadKunde = function() {
        if ($scope.kunde) {
          KundenOverviewModel.get({
            id: $scope.kunde.id
          }, function(kunde) {
            $scope.kunde = kunde;
          });
        }
      };

      $scope.aboLabel = function(abo) {
        if (!abo) {
          return 'nothing here';
        }
        return abo.abotypName + ', ' + abo.depotName;
      };

      msgBus.onMsg('EntityModified', $rootScope, function(event, msg) {
        if (msg.entity === 'Rechnung') {
          $rootScope.$apply();
        }
      });

      $scope.open = {
        rechnungsdatum: false,
      };

      $scope.openCalendar = function(e, date) {
        e.preventDefault();
        e.stopPropagation();

        $scope.open[date] = true;
      };

      $scope.isExisting = function() {
        return angular.isDefined($scope.rechnung) && angular.isDefined($scope.rechnung
          .id);
      };

      $scope.save = function() {
        return $scope.rechnung.$save();
      };

      $scope.created = function(id) {
        $location.path('/rechnungen/' + id);
      };

      $scope.backToList = function() {
        $location.path('/rechnungen');
      };

      $scope.delete = function() {
        return $scope.rechnung.$delete();
      };
    }
  ]);
