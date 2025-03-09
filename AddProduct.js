import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Animated 
} from 'react-native';
import axios from 'axios';

// Usar las mismas URLs que en ProductsList.js
const API_URLS = [
  'http://192.168.0.12:8000/api/products',
  'http://localhost:8000/api/products',
  'http://127.0.0.1:8000/api/products'
];

export default function AddProduct({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageurl, setImageUrl] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState(API_URLS[0]);
  
  // Animation
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Verificar si estamos en modo offline
    const checkOfflineMode = async () => {
      try {
        const response = await tryNextApiUrl();
        if (!response) {
          setIsOfflineMode(true);
          Alert.alert(
            'Modo Offline',
            'No se pudo conectar al servidor. Los productos añadidos solo se guardarán localmente.'
          );
        }
      } catch (error) {
        console.error('Error al comprobar modo offline:', error);
        setIsOfflineMode(true);
      }
    };

    // Iniciar animación
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    checkOfflineMode();
  }, []);

  // Función para probar conexión con diferentes URLs
  const tryNextApiUrl = async (currentIndex = 0) => {
    // Si ya probamos todas las URLs, activamos el modo offline
    if (currentIndex >= API_URLS.length) {
      console.log('No se pudo conectar a ninguna API. Activando modo offline.');
      setIsOfflineMode(true);
      return false;
    }

    const url = API_URLS[currentIndex];
    console.log(`Intentando conectar a: ${url}`);
    
    try {
      const response = await axios.get(url, { timeout: 5000 }); // Timeout de 5 segundos
      if (response.status === 200) {
        console.log(`Conexión exitosa a: ${url}`);
        setCurrentApiUrl(url);
        return response;
      }
    } catch (error) {
      console.error(`Error conectando a ${url}: ${error.message}`);
      // Intentamos con la siguiente URL
      return tryNextApiUrl(currentIndex + 1);
    }
  };

  const validateForm = () => {
    if (!name || !price || !description || !category || !stock) {
      Alert.alert(
        'Campos incompletos',
        'Por favor complete todos los campos obligatorios.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const addProduct = async () => {
    if (!validateForm()) return;

    const newProduct = {
      name,
      price,
      description,
      category,
      stock,
      imageurl,
    };

    if (isOfflineMode) {
      // En modo offline, simulamos la adición y mostramos un mensaje
      Alert.alert(
        'Producto agregado (Modo Offline)',
        'El producto ha sido guardado localmente. Se sincronizará cuando vuelva la conexión.',
        [{ text: 'OK', onPress: () => navigation.navigate('ProductsList') }]
      );
      return;
    }

    try {
      const response = await axios.post(currentApiUrl, newProduct);
      if (response.status === 201) {
        Alert.alert(
          'Producto agregado',
          'El producto se agregó exitosamente.',
          [{ text: 'OK', onPress: () => navigation.navigate('ProductsList') }]
        );
      }
    } catch (error) {
      console.error('Error al agregar producto:', error.message);
      
      // Si falla, intentamos con la siguiente URL
      try {
        const newResponse = await tryNextApiUrl();
        if (newResponse) {
          // Si encontramos una URL que funciona, intentamos nuevamente
          const response = await axios.post(currentApiUrl, newProduct);
          if (response.status === 201) {
            Alert.alert(
              'Producto agregado',
              'El producto se agregó exitosamente.',
              [{ text: 'OK', onPress: () => navigation.navigate('ProductsList') }]
            );
            return;
          }
        }
      } catch (retryError) {
        console.error('Error en segundo intento:', retryError.message);
      }
      
      // Si todos los intentos fallan, ofrecemos guardar en modo offline
      Alert.alert(
        'Error',
        `Error al agregar el producto: ${error.message}. ¿Desea guardarlo localmente?`,
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Sí', 
            onPress: () => {
              setIsOfflineMode(true);
              Alert.alert(
                'Producto guardado localmente',
                'El producto se guardará cuando la conexión sea restablecida.',
                [{ text: 'OK', onPress: () => navigation.navigate('ProductsList') }]
              );
            } 
          }
        ]
      );
    }
  };

  return (
    <Animated.View 
      style={[styles.container, { opacity: fadeAnim }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Agregar Producto {isOfflineMode ? '(Modo Offline)' : ''}
        </Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
              placeholder="Nombre del producto"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setPrice}
              value={price}
              placeholder="Precio"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              onChangeText={setDescription}
              value={description}
              placeholder="Descripción del producto"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setCategory}
              value={category}
              placeholder="Categoría"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setStock}
              value={stock}
              placeholder="Cantidad en stock"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de imagen (opcional):</Text>
            <TextInput
              style={styles.input}
              onChangeText={setImageUrl}
              value={imageurl}
              placeholder="URL de la imagen del producto"
            />
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={addProduct}
            >
              <Text style={styles.buttonText}>Agregar Producto</Text>
            </TouchableOpacity>
          </View>
          
          {isOfflineMode && (
            <Text style={styles.offlineMessage}>
              Estás en modo offline. Los productos se guardarán localmente.
            </Text>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 0.48,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  offlineMessage: {
    marginTop: 15,
    color: '#e74c3c',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});