from django.urls import path
from protheus.views import (
     StockView, 
     StockMovementView,
     SalesView,
     LocationsView, 
     DeliveryView, 
     DeliveryStatusView, 
     PendingDeliveriesView
)


app_name = "protheus"

urlpatterns = [
    path("stocks/", StockView.as_view(), name="stocks-summary"),
    path("stocks_moviment/", StockMovementView.as_view(), name="stocks-moviment-summary"),
    path("sales/", SalesView.as_view(), name="sales-summary"),
    path("locations/", LocationsView.as_view(), name="locations-list"), 
    path("deliveries/", DeliveryView.as_view(), name="deliveries-list"),
    path("deliveries/status/", DeliveryStatusView.as_view(), name="deliveries-status"),
    path("deliveries/pending/", PendingDeliveriesView.as_view(), name="deliveries-pending"),
]