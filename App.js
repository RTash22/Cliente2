import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import ProductsList from './screens/products/ProductsList';
import ProductDetail from './screens/products/ProductDetail';
import AddProduct from './screens/products/AddProduct';
import SalesList from './screens/sales/SalesList';
import SaleDetail from './screens/sales/SaleDetail';
import AddSale from './screens/sales/AddSale';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator para productos
function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductsHome" component={ProductsList} options={{ title: 'Productos' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ title: 'Detalle del Producto' }} />
      <Stack.Screen name="AddProduct" component={AddProduct} options={{ title: 'Agregar Producto' }} />
    </Stack.Navigator>
  );
}

// Stack navigator para ventas
function SalesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SalesHome" component={SalesList} options={{ title: 'Ventas' }} />
      <Stack.Screen name="SaleDetail" component={SaleDetail} options={{ title: 'Detalle de Venta' }} />
      <Stack.Screen name="AddSale" component={AddSale} options={{ title: 'Agregar Venta' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let icon = '📦';
            if (route.name === 'Ventas') {
              icon = '💰';
            }
            return <Text style={{ fontSize: size }}>{icon}</Text>;
          },
          tabBarActiveTintColor: '#2ecc71',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Productos" 
          component={ProductsStack} 
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen 
          name="Ventas" 
          component={SalesStack}
          options={{
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}