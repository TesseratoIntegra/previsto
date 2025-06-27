from django.urls import path

from protheus.views import StockView, StockMovementView, ProductView


urlpatterns = [
    path('stocks/', StockView.as_view(), name='stocks_summary'),
    path('stock-moviments/', StockMovementView.as_view(), name='stocks_moviment_summary'),
    path('products/', ProductView.as_view(), name='sales_summary'),
]
