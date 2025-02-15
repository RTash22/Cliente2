import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function AddProduct({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageurl, setImageurl] = useState('');

  const addProduct = async () => {
    try {
      const response = await axios.post('http://192.168.0.17:8000/api/products', {
        name,
        price,
        description,
        category,
        stock,
        imageurl,
      });
      if (response.status === 201) {
        Alert.alert(
          'Producto agregado',
          'El producto se agregó exitosamente.',
          [
            { text: 'OK', onPress: () => navigation.navigate('ProductsList') }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Error al agregar el producto: ${error.message}`,
        [
          { text: 'OK', onPress: () => navigation.navigate('ProductsList') }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Producto</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
      />
      <TextInput
        style={styles.input}
        placeholder="URL de la imagen"
        value={imageurl}
        onChangeText={setImageurl}
      />
      <TouchableOpacity style={styles.button} onPress={addProduct}>
        <Text style={styles.buttonText}>Agregar Producto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});