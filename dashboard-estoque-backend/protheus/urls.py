from django.urls import path
from protheus.views import StockView, StockMovementView, SalesView


app_name = "protheus"

urlpatterns = [
    path("stocks/", StockView.as_view(), name="stocks-summary"),
    path("stocks_moviment/", StockMovementView.as_view(), name="stocks-moviment-summary"),
    path("sales/", SalesView.as_view(), name="sales-summary"),
]
