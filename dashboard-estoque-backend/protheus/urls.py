from django.urls import path

from protheus.views import StockView, StockMovementView, ProductView


urlpatterns = [
    path('stocks/', StockView.as_view(), name='stocks-summary'),
    path('stocks_moviment/', StockMovementView.as_view(), name='stocks-moviment-summary'),
    path('products/', ProductView.as_view(), name='sales-summary'),
]
