import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsList from './ProductsList';
import ProductDetail from './ProductDetail';
import AddProduct from './AddProduct';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ProductsList">
        <Stack.Screen name="ProductsList" component={ProductsList} options={{ title: 'Productos' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ title: 'Detalle del Producto' }} />
        <Stack.Screen name="AddProduct" component={AddProduct} options={{ title: 'Agregar Producto' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}