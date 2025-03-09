import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsList from './screens/products/ProductsList';
import ProductDetail from './screens/products/ProductDetail';
import AddProduct from './screens/products/AddProduct';
import SalesList from './screens/sales/SalesList';
import SaleDetail from './screens/sales/SaleDetail';
import AddSale from './screens/sales/AddSale';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ProductsList">
        <Stack.Screen name="ProductsList" component={ProductsList} options={{ title: 'Productos' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ title: 'Detalle del Producto' }} />
        <Stack.Screen name="AddProduct" component={AddProduct} options={{ title: 'Agregar Producto' }} />
        <Stack.Screen name="SalesList" component={SalesList} options={{ title: 'Ventas' }} />
        <Stack.Screen name="SaleDetail" component={SaleDetail} options={{ title: 'Detalle de Venta' }} />
        <Stack.Screen name="AddSale" component={AddSale} options={{ title: 'Agregar Venta' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}