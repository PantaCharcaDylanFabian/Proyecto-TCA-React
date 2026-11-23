import type { TopCategory } from '../types';

export const TOP_CATEGORIES: TopCategory[] = [
  {
    "id": "alimentos",
    "name": "ALIMENTOS",
    "href": "/catalogo?q=ALIMENTOS",
    "groups": [
      {
        "id": "abarrotes",
        "label": "Abarrotes",
        "title": "Abarrotes",
        "columns": [
          {
            "title": "ACEITES DE COCINA",
            "href": "categoria-aceites.html",
            "links": [
              {
                "href": "categoria-aceites.html",
                "label": "ACEITES DE COCINA"
              },
              {
                "href": "productos-visor.html?subcat=aceites-clasicos",
                "label": "Aceites clásicos"
              },
              {
                "href": "/catalogo?q=Aceites%20especiales",
                "label": "Aceites especiales"
              },
              {
                "href": "/catalogo?q=Aceites%20de%20oliva",
                "label": "Aceites de oliva"
              }
            ]
          },
          {
            "title": "ACEITUNAS",
            "href": "/catalogo?q=ACEITUNAS",
            "links": [
              {
                "href": "/catalogo?q=ACEITUNAS",
                "label": "ACEITUNAS"
              },
              {
                "href": "productos-visor.html?subcat=aceitunas-negras",
                "label": "Negras"
              },
              {
                "href": "/catalogo?q=Verdes",
                "label": "Verdes"
              }
            ]
          },
          {
            "title": "CONSERVAS DE ALIMENTOS",
            "href": "/catalogo?q=CONSERVAS%20DE%20ALIMENTOS",
            "links": [
              {
                "href": "/catalogo?q=CONSERVAS%20DE%20ALIMENTOS",
                "label": "CONSERVAS DE ALIMENTOS"
              },
              {
                "href": "/catalogo?q=Champi%C3%B1ones",
                "label": "Champiñones"
              },
              {
                "href": "/catalogo?q=Choclo",
                "label": "Choclo"
              },
              {
                "href": "/catalogo?q=Frijoles",
                "label": "Frijoles"
              },
              {
                "href": "/catalogo?q=Garbanzos",
                "label": "Garbanzos"
              },
              {
                "href": "/catalogo?q=Pallares",
                "label": "Pallares"
              }
            ]
          },
          {
            "title": "CONSERVAS MARINAS",
            "href": "/catalogo?q=CONSERVAS%20MARINAS",
            "links": [
              {
                "href": "/catalogo?q=CONSERVAS%20MARINAS",
                "label": "CONSERVAS MARINAS"
              },
              {
                "href": "/catalogo?q=Conservas%20de%20Bonito",
                "label": "Conservas de Bonito"
              },
              {
                "href": "subcategoria-conservasdeatun.html",
                "label": "Conservas de Atún"
              },
              {
                "href": "subcategoria-conservasdebonito.html",
                "label": "Conservas de Caballa"
              },
              {
                "href": "/catalogo?q=Conservas%20de%20Jurel",
                "label": "Conservas de Jurel"
              }
            ]
          },
          {
            "title": "AZÚCAR Y ENDULZANTES",
            "href": "categoria-azucar.html",
            "links": [
              {
                "href": "categoria-azucar.html",
                "label": "AZÚCAR Y ENDULZANTES"
              },
              {
                "href": "/catalogo?q=Endulzantes%20naturales",
                "label": "Endulzantes naturales"
              },
              {
                "href": "/catalogo?q=Endulzantes%20refinados",
                "label": "Endulzantes refinados"
              }
            ]
          },
          {
            "title": "FRUTAS EN CONSERVA",
            "href": "/catalogo?q=FRUTAS%20EN%20CONSERVA",
            "links": [
              {
                "href": "/catalogo?q=FRUTAS%20EN%20CONSERVA",
                "label": "FRUTAS EN CONSERVA"
              },
              {
                "href": "/catalogo?q=Conservas%20de%20fruta",
                "label": "Conservas de fruta"
              }
            ]
          },
          {
            "title": "Arroz",
            "href": "/catalogo?q=Arroz",
            "links": [
              {
                "href": "/catalogo?q=Arroz",
                "label": "Arroz"
              },
              {
                "href": "/catalogo?q=Arroz%20a%C3%B1ejo%20superior",
                "label": "Arroz añejo superior"
              }
            ]
          },
          {
            "title": "GRANOS Y MENESTRAS",
            "href": "/catalogo?q=GRANOS%20Y%20MENESTRAS",
            "links": [
              {
                "href": "/catalogo?q=GRANOS%20Y%20MENESTRAS",
                "label": "GRANOS Y MENESTRAS"
              },
              {
                "href": "/catalogo?q=Arverjas",
                "label": "Arverjas"
              },
              {
                "href": "/catalogo?q=Frijoles",
                "label": "Frijoles"
              },
              {
                "href": "/catalogo?q=Lentejas",
                "label": "Lentejas"
              },
              {
                "href": "/catalogo?q=Maiz%20Pop%20Corn",
                "label": "Maiz Pop Corn"
              },
              {
                "href": "/catalogo?q=Quinua",
                "label": "Quinua"
              },
              {
                "href": "/catalogo?q=Bolsa",
                "label": "Bolsa"
              }
            ]
          },
          {
            "title": "HARINAS ESPECIALES",
            "href": "/catalogo?q=HARINAS%20ESPECIALES",
            "links": [
              {
                "href": "/catalogo?q=HARINAS%20ESPECIALES",
                "label": "HARINAS ESPECIALES"
              },
              {
                "href": "/catalogo?q=Chu%C3%B1o",
                "label": "Chuño"
              },
              {
                "href": "/catalogo?q=Habas%20tostadas",
                "label": "Habas tostadas"
              },
              {
                "href": "/catalogo?q=Maicena",
                "label": "Maicena"
              },
              {
                "href": "/catalogo?q=Semola",
                "label": "Semola"
              }
            ]
          },
          {
            "title": "HARINAS TRADICIONALES",
            "href": "/catalogo?q=HARINAS%20TRADICIONALES",
            "links": [
              {
                "href": "/catalogo?q=HARINAS%20TRADICIONALES",
                "label": "HARINAS TRADICIONALES"
              },
              {
                "href": "/productos-visor.html?subcat=harina-preparada",
                "label": "Preparada"
              },
              {
                "href": "/catalogo?q=Sin%20preparar",
                "label": "Sin preparar"
              }
            ]
          },
          {
            "title": "ALIMENTOS INSTANTÁNEOS",
            "href": "/catalogo?q=ALIMENTOS%20INSTANT%C3%81NEOS",
            "links": [
              {
                "href": "/catalogo?q=ALIMENTOS%20INSTANT%C3%81NEOS",
                "label": "ALIMENTOS INSTANTÁNEOS"
              },
              {
                "href": "/catalogo?q=Pur%C3%A9%20de%20papa",
                "label": "Puré de papa"
              },
              {
                "href": "/catalogo?q=Sopas",
                "label": "Sopas"
              },
              {
                "href": "/catalogo?q=Tallarines",
                "label": "Tallarines"
              }
            ]
          },
          {
            "title": "FIDEOS Y PASTAS",
            "href": "/catalogo?q=FIDEOS%20Y%20PASTAS",
            "links": [
              {
                "href": "/catalogo?q=FIDEOS%20Y%20PASTAS",
                "label": "FIDEOS Y PASTAS"
              },
              {
                "href": "/catalogo?q=Fideos",
                "label": "Fideos"
              },
              {
                "href": "/catalogo?q=PASTAS%20-%20LASAGNA",
                "label": "PASTAS - LASAGNA"
              }
            ]
          }
        ]
      },
      {
        "id": "condimentos",
        "label": "Condimentos",
        "title": "Condimentos",
        "columns": [
          {
            "title": "MEZCLAS DE COCINA",
            "href": "/catalogo?q=MEZCLAS%20DE%20COCINA",
            "links": [
              {
                "href": "/catalogo?q=MEZCLAS%20DE%20COCINA",
                "label": "MEZCLAS DE COCINA"
              },
              {
                "href": "/catalogo?q=Ablandador",
                "label": "Ablandador"
              },
              {
                "href": "/catalogo?q=Apanador",
                "label": "Apanador"
              }
            ]
          },
          {
            "title": "SAZONADORES",
            "href": "/catalogo?q=SAZONADORES",
            "links": [
              {
                "href": "/catalogo?q=SAZONADORES",
                "label": "SAZONADORES"
              },
              {
                "href": "/catalogo?q=Sillao",
                "label": "Sillao"
              },
              {
                "href": "/catalogo?q=Sazonadores",
                "label": "Sazonadores"
              }
            ]
          },
          {
            "title": "VINAGRES",
            "href": "/catalogo?q=VINAGRES",
            "links": [
              {
                "href": "/catalogo?q=VINAGRES",
                "label": "VINAGRES"
              },
              {
                "href": "/catalogo?q=Vinagre%20cl%C3%A1sico",
                "label": "Vinagre clásico"
              },
              {
                "href": "/catalogo?q=Vinagre%20especial",
                "label": "Vinagre especial"
              }
            ]
          }
        ]
      },
      {
        "id": "desayunos",
        "label": "Desayunos",
        "title": "Desayunos",
        "columns": [
          {
            "title": "AVENAS",
            "href": "/catalogo?q=AVENAS",
            "links": [
              {
                "href": "/catalogo?q=AVENAS",
                "label": "AVENAS"
              },
              {
                "href": "/catalogo?q=Instantaneas",
                "label": "Instantaneas"
              },
              {
                "href": "/catalogo?q=Reforzadas",
                "label": "Reforzadas"
              },
              {
                "href": "/catalogo?q=Saborizadas",
                "label": "Saborizadas"
              },
              {
                "href": "/catalogo?q=Tradicional",
                "label": "Tradicional"
              }
            ]
          },
          {
            "title": "CAFÉS",
            "href": "/catalogo?q=CAF%C3%89S",
            "links": [
              {
                "href": "/catalogo?q=CAF%C3%89S",
                "label": "CAFÉS"
              },
              {
                "href": "/catalogo?q=Instantaneos",
                "label": "Instantaneos"
              },
              {
                "href": "/catalogo?q=Molido",
                "label": "Molido"
              },
              {
                "href": "/catalogo?q=Grano",
                "label": "Grano"
              }
            ]
          },
          {
            "title": "CEBADAS",
            "href": "/catalogo?q=CEBADAS",
            "links": [
              {
                "href": "/catalogo?q=CEBADAS",
                "label": "CEBADAS"
              },
              {
                "href": "/catalogo?q=Polvo",
                "label": "Polvo"
              }
            ]
          },
          {
            "title": "CEREALES",
            "href": "/catalogo?q=CEREALES",
            "links": [
              {
                "href": "/catalogo?q=CEREALES",
                "label": "CEREALES"
              },
              {
                "href": "/catalogo?q=Saborizados",
                "label": "Saborizados"
              },
              {
                "href": "/catalogo?q=Cl%C3%A1sicos",
                "label": "Clásicos"
              }
            ]
          },
          {
            "title": "COMPLEMENTO LÁCTEO",
            "href": "/catalogo?q=COMPLEMENTO%20L%C3%81CTEO",
            "links": [
              {
                "href": "/catalogo?q=COMPLEMENTO%20L%C3%81CTEO",
                "label": "COMPLEMENTO LÁCTEO"
              },
              {
                "href": "/catalogo?q=Chocolate%20para%20taza",
                "label": "Chocolate para taza"
              },
              {
                "href": "/catalogo?q=Refuerzo%20Nutritivo",
                "label": "Refuerzo Nutritivo"
              }
            ]
          },
          {
            "title": "FIAMBRES",
            "href": "/catalogo?q=FIAMBRES",
            "links": [
              {
                "href": "/catalogo?q=FIAMBRES",
                "label": "FIAMBRES"
              },
              {
                "href": "productos-visor.html?subcat=jamones-untables-y-pate",
                "label": "Jamones untables y pates"
              }
            ]
          },
          {
            "title": "INFUSIONES",
            "href": "/catalogo?q=INFUSIONES",
            "links": [
              {
                "href": "/catalogo?q=INFUSIONES",
                "label": "INFUSIONES"
              },
              {
                "href": "/catalogo?q=Funcional",
                "label": "Funcional"
              },
              {
                "href": "/catalogo?q=Tradicional",
                "label": "Tradicional"
              }
            ]
          },
          {
            "title": "LACTEOS ALTERNATIVOS",
            "href": "/catalogo?q=LACTEOS%20ALTERNATIVOS",
            "links": [
              {
                "href": "/catalogo?q=LACTEOS%20ALTERNATIVOS",
                "label": "LACTEOS ALTERNATIVOS"
              },
              {
                "href": "/catalogo?q=Leches%20vegetales",
                "label": "Leches vegetales"
              }
            ]
          },
          {
            "title": "LÁCTEOS Y DERIVADOS",
            "href": "/catalogo?q=L%C3%81CTEOS%20Y%20DERIVADOS",
            "links": [
              {
                "href": "/catalogo?q=L%C3%81CTEOS%20Y%20DERIVADOS",
                "label": "LÁCTEOS Y DERIVADOS"
              },
              {
                "href": "/catalogo?q=Margarina",
                "label": "Margarina"
              }
            ]
          },
          {
            "title": "UNTABLES",
            "href": "/catalogo?q=UNTABLES",
            "links": [
              {
                "href": "/catalogo?q=UNTABLES",
                "label": "UNTABLES"
              },
              {
                "href": "/catalogo?q=Cremas",
                "label": "Cremas"
              },
              {
                "href": "/catalogo?q=Mermeladas",
                "label": "Mermeladas"
              }
            ]
          }
        ]
      },
      {
        "id": "dulces",
        "label": "Dulces y postres",
        "title": "Dulces y postres",
        "columns": [
          {
            "title": "BARRAS ENERGÉTICAS",
            "href": "/catalogo?q=BARRAS%20ENERG%C3%89TICAS",
            "links": [
              {
                "href": "/catalogo?q=BARRAS%20ENERG%C3%89TICAS",
                "label": "BARRAS ENERGÉTICAS"
              },
              {
                "href": "/catalogo?q=Cereal",
                "label": "Cereal"
              }
            ]
          },
          {
            "title": "BIZCOCHOS",
            "href": "/catalogo?q=BIZCOCHOS",
            "links": [
              {
                "href": "/catalogo?q=BIZCOCHOS",
                "label": "BIZCOCHOS"
              },
              {
                "href": "/catalogo?q=Rellenos",
                "label": "Rellenos"
              }
            ]
          },
          {
            "title": "COMPOTAS DE FRUTA",
            "href": "/catalogo?q=COMPOTAS%20DE%20FRUTA",
            "links": [
              {
                "href": "/catalogo?q=COMPOTAS%20DE%20FRUTA",
                "label": "COMPOTAS DE FRUTA"
              },
              {
                "href": "/catalogo?q=Mini%20DPK",
                "label": "Mini DPK"
              }
            ]
          },
          {
            "title": "GALLETAS",
            "href": "/catalogo?q=GALLETAS",
            "links": [
              {
                "href": "/catalogo?q=GALLETAS",
                "label": "GALLETAS"
              },
              {
                "href": "/catalogo?q=Galletas%20dulces",
                "label": "Galletas dulces"
              },
              {
                "href": "/catalogo?q=Galletas%20integrales",
                "label": "Galletas integrales"
              }
            ]
          },
          {
            "title": "POSTRES INSTANTÁNEOS",
            "href": "/catalogo?q=POSTRES%20INSTANT%C3%81NEOS",
            "links": [
              {
                "href": "/catalogo?q=POSTRES%20INSTANT%C3%81NEOS",
                "label": "POSTRES INSTANTÁNEOS"
              },
              {
                "href": "/catalogo?q=Polvo",
                "label": "Polvo"
              }
            ]
          },
          {
            "title": "MEZCLAS Y REPOSTERÍAS",
            "href": "/catalogo?q=MEZCLAS%20Y%20REPOSTER%C3%8DAS",
            "links": [
              {
                "href": "/catalogo?q=MEZCLAS%20Y%20REPOSTER%C3%8DAS",
                "label": "MEZCLAS Y REPOSTERÍAS"
              },
              {
                "href": "/catalogo?q=Concentrados",
                "label": "Concentrados"
              },
              {
                "href": "/catalogo?q=Pre-Mezclas",
                "label": "Pre-Mezclas"
              }
            ]
          },
          {
            "title": "UNTABLES",
            "href": "/catalogo?q=UNTABLES",
            "links": [
              {
                "href": "/catalogo?q=UNTABLES",
                "label": "UNTABLES"
              },
              {
                "href": "/catalogo?q=Cremas",
                "label": "Cremas"
              }
            ]
          },
          {
            "title": "WAFER Y CHOCOWAFER",
            "href": "/catalogo?q=WAFER%20Y%20CHOCOWAFER",
            "links": [
              {
                "href": "/catalogo?q=WAFER%20Y%20CHOCOWAFER",
                "label": "WAFER Y CHOCOWAFER"
              },
              {
                "href": "/catalogo?q=Rellenos%20clasicos",
                "label": "Rellenos clasicos"
              },
              {
                "href": "/catalogo?q=Ba%C3%B1ado",
                "label": "Bañado"
              },
              {
                "href": "/catalogo?q=Tubulares",
                "label": "Tubulares"
              }
            ]
          }
        ]
      },
      {
        "id": "golosinas",
        "label": "Golosinas",
        "title": "Golosinas",
        "columns": [
          {
            "title": "MENTAS Y CARAMELOS FUNCIONALES",
            "href": "/catalogo?q=MENTAS%20Y%20CARAMELOS%20FUNCIONALES",
            "links": [
              {
                "href": "/catalogo?q=MENTAS%20Y%20CARAMELOS%20FUNCIONALES",
                "label": "MENTAS Y CARAMELOS FUNCIONALES"
              },
              {
                "href": "/catalogo?q=Funcionales",
                "label": "Funcionales"
              },
              {
                "href": "/catalogo?q=Infantiles",
                "label": "Infantiles"
              }
            ]
          }
        ]
      },
      {
        "id": "salsas",
        "label": "Salsas",
        "title": "Salsas",
        "columns": [
          {
            "title": "SALSAS Y ACOMPAÑAMIENTOS",
            "href": "/catalogo?q=SALSAS%20Y%20ACOMPA%C3%91AMIENTOS",
            "links": [
              {
                "href": "/catalogo?q=SALSAS%20Y%20ACOMPA%C3%91AMIENTOS",
                "label": "SALSAS Y ACOMPAÑAMIENTOS"
              },
              {
                "href": "/catalogo?q=Dulces",
                "label": "Dulces"
              },
              {
                "href": "/catalogo?q=Saladas",
                "label": "Saladas"
              }
            ]
          },
          {
            "title": "SALSAS LISTAS",
            "href": "/catalogo?q=SALSAS%20LISTAS",
            "links": [
              {
                "href": "/catalogo?q=SALSAS%20LISTAS",
                "label": "SALSAS LISTAS"
              },
              {
                "href": "/catalogo?q=Bolognesa",
                "label": "Bolognesa"
              },
              {
                "href": "/catalogo?q=Hongos",
                "label": "Hongos"
              },
              {
                "href": "/catalogo?q=Tomate",
                "label": "Tomate"
              }
            ]
          }
        ]
      },
      {
        "id": "snacks",
        "label": "Snacks salados",
        "title": "Snacks salados",
        "columns": [
          {
            "title": "FRITURAS",
            "href": "/catalogo?q=FRITURAS",
            "links": [
              {
                "href": "/catalogo?q=FRITURAS",
                "label": "FRITURAS"
              },
              {
                "href": "/catalogo?q=Papas%20fritas",
                "label": "Papas fritas"
              }
            ]
          },
          {
            "title": "GALLETAS SALADAS",
            "href": "/catalogo?q=GALLETAS%20SALADAS",
            "links": [
              {
                "href": "/catalogo?q=GALLETAS%20SALADAS",
                "label": "GALLETAS SALADAS"
              },
              {
                "href": "/catalogo?q=Planas",
                "label": "Planas"
              }
            ]
          },
          {
            "title": "POP CORN PARA MICROONDAS",
            "href": "/catalogo?q=POP%20CORN%20PARA%20MICROONDAS",
            "links": [
              {
                "href": "/catalogo?q=POP%20CORN%20PARA%20MICROONDAS",
                "label": "POP CORN PARA MICROONDAS"
              },
              {
                "href": "/catalogo?q=Jalape%C3%B1o",
                "label": "Jalapeño"
              },
              {
                "href": "/catalogo?q=Mantequilla",
                "label": "Mantequilla"
              },
              {
                "href": "/catalogo?q=Mantequilla%20extra",
                "label": "Mantequilla extra"
              },
              {
                "href": "/catalogo?q=Mantequilla%20light",
                "label": "Mantequilla light"
              },
              {
                "href": "/catalogo?q=Natural",
                "label": "Natural"
              },
              {
                "href": "/catalogo?q=Queso",
                "label": "Queso"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "bebidas",
    "name": "BEBIDAS",
    "href": "categoria-bebidas.html",
    "groups": [
      {
        "id": "alcoholicas",
        "label": "Alcohólicas",
        "title": "Alcohólicas",
        "columns": [
          {
            "title": "CERVEZAS",
            "href": "/catalogo?q=CERVEZAS",
            "links": [
              {
                "href": "/catalogo?q=CERVEZAS",
                "label": "CERVEZAS"
              },
              {
                "href": "/catalogo?q=Dorada",
                "label": "Dorada"
              },
              {
                "href": "/catalogo?q=Lager",
                "label": "Lager"
              },
              {
                "href": "/catalogo?q=Negra",
                "label": "Negra"
              },
              {
                "href": "/catalogo?q=Pilsener",
                "label": "Pilsener"
              },
              {
                "href": "/catalogo?q=Trigo",
                "label": "Trigo"
              }
            ]
          },
          {
            "title": "LICORES",
            "href": "/catalogo?q=LICORES",
            "links": [
              {
                "href": "/catalogo?q=LICORES",
                "label": "LICORES"
              },
              {
                "href": "/catalogo?q=Espumante",
                "label": "Espumante"
              },
              {
                "href": "/catalogo?q=Pisco",
                "label": "Pisco"
              },
              {
                "href": "/catalogo?q=Ron",
                "label": "Ron"
              },
              {
                "href": "/catalogo?q=Vino%20y%20sangr%C3%ADa",
                "label": "Vino y sangría"
              },
              {
                "href": "/catalogo?q=Vodka",
                "label": "Vodka"
              },
              {
                "href": "/catalogo?q=Whisky",
                "label": "Whisky"
              }
            ]
          },
          {
            "title": "RTD - READY TO DRINK",
            "href": "/catalogo?q=RTD%20-%20READY%20TO%20DRINK",
            "links": [
              {
                "href": "/catalogo?q=RTD%20-%20READY%20TO%20DRINK",
                "label": "RTD - READY TO DRINK"
              },
              {
                "href": "/catalogo?q=Ar%C3%A1ndanos",
                "label": "Arándanos"
              },
              {
                "href": "/catalogo?q=Borgo%C3%B1a",
                "label": "Borgoña"
              },
              {
                "href": "/catalogo?q=Cranberry",
                "label": "Cranberry"
              },
              {
                "href": "/catalogo?q=Fresa",
                "label": "Fresa"
              },
              {
                "href": "/catalogo?q=Ice%20red",
                "label": "Ice red"
              },
              {
                "href": "/catalogo?q=Uva",
                "label": "Uva"
              },
              {
                "href": "/catalogo?q=Lim%C3%B3n",
                "label": "Limón"
              },
              {
                "href": "/catalogo?q=Mango",
                "label": "Mango"
              },
              {
                "href": "/catalogo?q=Manzana",
                "label": "Manzana"
              },
              {
                "href": "/catalogo?q=Maracuy%C3%A1",
                "label": "Maracuyá"
              },
              {
                "href": "/catalogo?q=Mojito",
                "label": "Mojito"
              },
              {
                "href": "/catalogo?q=Mora",
                "label": "Mora"
              },
              {
                "href": "/catalogo?q=Naranja",
                "label": "Naranja"
              },
              {
                "href": "/catalogo?q=Pack%20surtido",
                "label": "Pack surtido"
              },
              {
                "href": "/catalogo?q=Pink%20lemonade",
                "label": "Pink lemonade"
              },
              {
                "href": "/catalogo?q=Pi%C3%B1a%20colada",
                "label": "Piña colada"
              },
              {
                "href": "/catalogo?q=Pi%C3%B1a%20menta",
                "label": "Piña menta"
              },
              {
                "href": "/catalogo?q=Rose",
                "label": "Rose"
              },
              {
                "href": "/catalogo?q=Sand%C3%ADa",
                "label": "Sandía"
              },
              {
                "href": "/catalogo?q=Tropical%20blue",
                "label": "Tropical blue"
              },
              {
                "href": "/catalogo?q=Tutti%20frutti",
                "label": "Tutti frutti"
              }
            ]
          }
        ]
      },
      {
        "id": "sin-alcohol",
        "label": "Sin Alcohol",
        "title": "Sin Alcohol",
        "columns": [
          {
            "title": "ENERGIZANTES Y MALTAS",
            "href": "/catalogo?q=ENERGIZANTES%20Y%20MALTAS",
            "links": [
              {
                "href": "/catalogo?q=ENERGIZANTES%20Y%20MALTAS",
                "label": "ENERGIZANTES Y MALTAS"
              },
              {
                "href": "/catalogo?q=Camu%20camu",
                "label": "Camu camu"
              },
              {
                "href": "/catalogo?q=Cl%C3%A1sico",
                "label": "Clásico"
              },
              {
                "href": "/catalogo?q=Col%C3%A1geno",
                "label": "Colágeno"
              },
              {
                "href": "/catalogo?q=Fresa",
                "label": "Fresa"
              },
              {
                "href": "/catalogo?q=Ginseng",
                "label": "Ginseng"
              },
              {
                "href": "/catalogo?q=Uva",
                "label": "Uva"
              },
              {
                "href": "/catalogo?q=Maltas",
                "label": "Maltas"
              }
            ]
          },
          {
            "title": "GASEOSAS",
            "href": "/catalogo?q=GASEOSAS",
            "links": [
              {
                "href": "/catalogo?q=GASEOSAS",
                "label": "GASEOSAS"
              },
              {
                "href": "/catalogo?q=Amarillas",
                "label": "Amarillas"
              },
              {
                "href": "/catalogo?q=Blancas",
                "label": "Blancas"
              },
              {
                "href": "/catalogo?q=Colas",
                "label": "Colas"
              },
              {
                "href": "/catalogo?q=Fantas%C3%ADa",
                "label": "Fantasía"
              },
              {
                "href": "/catalogo?q=Guaran%C3%A1s",
                "label": "Guaranás"
              }
            ]
          },
          {
            "title": "REFRESCOS INSTANTÁNEOS",
            "href": "/catalogo?q=REFRESCOS%20INSTANT%C3%81NEOS",
            "links": [
              {
                "href": "/catalogo?q=REFRESCOS%20INSTANT%C3%81NEOS",
                "label": "REFRESCOS INSTANTÁNEOS"
              },
              {
                "href": "/catalogo?q=Refrescos%20en%20polvo",
                "label": "Refrescos en polvo"
              }
            ]
          },
          {
            "title": "BAR Y COMPLEMENTOS",
            "href": "/catalogo?q=BAR%20Y%20COMPLEMENTOS",
            "links": [
              {
                "href": "/catalogo?q=BAR%20Y%20COMPLEMENTOS",
                "label": "BAR Y COMPLEMENTOS"
              },
              {
                "href": "/catalogo?q=Goma",
                "label": "Goma"
              },
              {
                "href": "/catalogo?q=Granadina",
                "label": "Granadina"
              },
              {
                "href": "/catalogo?q=Ginger%20ale",
                "label": "Ginger ale"
              },
              {
                "href": "/catalogo?q=T%C3%B3nica",
                "label": "Tónica"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cuidado-personal",
    "name": "CUIDADO PERSONAL",
    "href": "categoria-cuidado-personal.html",
    "groups": [
      {
        "id": "capilar",
        "label": "Cuidado Capilar",
        "title": "Capilar",
        "columns": [
          {
            "title": "SHAMPOO Y ACONDICIONADOR",
            "href": "/catalogo?q=SHAMPOO%20Y%20ACONDICIONADOR",
            "links": [
              {
                "href": "/catalogo?q=SHAMPOO%20Y%20ACONDICIONADOR",
                "label": "SHAMPOO Y ACONDICIONADOR"
              },
              {
                "href": "/catalogo?q=Acondicionador",
                "label": "Acondicionador"
              },
              {
                "href": "/catalogo?q=Shampoo",
                "label": "Shampoo"
              },
              {
                "href": "/catalogo?q=Kits",
                "label": "Kits"
              }
            ]
          },
          {
            "title": "CREMAS Y TRATAMIENTOS",
            "href": "/catalogo?q=CREMAS%20Y%20TRATAMIENTOS",
            "links": [
              {
                "href": "/catalogo?q=CREMAS%20Y%20TRATAMIENTOS",
                "label": "CREMAS Y TRATAMIENTOS"
              },
              {
                "href": "/catalogo?q=Crema%20de%20peinar",
                "label": "Crema de peinar"
              },
              {
                "href": "/catalogo?q=Gel",
                "label": "Gel"
              },
              {
                "href": "/catalogo?q=Tratamiento%20capilar",
                "label": "Tratamiento capilar"
              }
            ]
          }
        ]
      },
      {
        "id": "sexual",
        "label": "Salud Sexual",
        "title": "Cuidado sexual e intimidad",
        "columns": [
          {
            "title": "ÍNTIMO",
            "href": "/catalogo?q=%C3%8DNTIMO",
            "links": [
              {
                "href": "/catalogo?q=%C3%8DNTIMO",
                "label": "ÍNTIMO"
              },
              {
                "href": "/catalogo?q=Lubricante",
                "label": "Lubricante"
              }
            ]
          },
          {
            "title": "PRESERVATIVOS",
            "href": "/catalogo?q=PRESERVATIVOS",
            "links": [
              {
                "href": "/catalogo?q=PRESERVATIVOS",
                "label": "PRESERVATIVOS"
              },
              {
                "href": "/catalogo?q=Cl%C3%A1sico",
                "label": "Clásico"
              },
              {
                "href": "/catalogo?q=Delgado",
                "label": "Delgado"
              },
              {
                "href": "/catalogo?q=Retardante",
                "label": "Retardante"
              },
              {
                "href": "/catalogo?q=Texturizados",
                "label": "Texturizados"
              }
            ]
          }
        ]
      },
      {
        "id": "dental",
        "label": "Cuidado Dental",
        "title": "Higiene dental y oral",
        "columns": [
          {
            "title": "CEPILLOS",
            "href": "/catalogo?q=CEPILLOS",
            "links": [
              {
                "href": "/catalogo?q=CEPILLOS",
                "label": "CEPILLOS"
              },
              {
                "href": "/catalogo?q=360%20COMPLETE",
                "label": "360 COMPLETE"
              },
              {
                "href": "/catalogo?q=360%20Luminous%20White",
                "label": "360 Luminous White"
              }
            ]
          },
          {
            "title": "CREMA DENTAL",
            "href": "/catalogo?q=CREMA%20DENTAL",
            "links": [
              {
                "href": "/catalogo?q=CREMA%20DENTAL",
                "label": "CREMA DENTAL"
              },
              {
                "href": "/catalogo?q=Anti%20caries",
                "label": "Anti caries"
              },
              {
                "href": "/catalogo?q=Blanqueadora",
                "label": "Blanqueadora"
              }
            ]
          },
          {
            "title": "CREMA DENTAL COMBO",
            "href": "/catalogo?q=CREMA%20DENTAL%20COMBO",
            "links": [
              {
                "href": "/catalogo?q=CREMA%20DENTAL%20COMBO",
                "label": "CREMA DENTAL COMBO"
              },
              {
                "href": "/catalogo?q=Anti%20caries",
                "label": "Anti caries"
              },
              {
                "href": "/catalogo?q=Herbal",
                "label": "Herbal"
              },
              {
                "href": "/catalogo?q=Triple%20acci%C3%B3n",
                "label": "Triple acción"
              }
            ]
          },
          {
            "title": "ENJUAGUES",
            "href": "/catalogo?q=ENJUAGUES",
            "links": [
              {
                "href": "/catalogo?q=ENJUAGUES",
                "label": "ENJUAGUES"
              },
              {
                "href": "/catalogo?q=Con%20alcohol",
                "label": "Con alcohol"
              },
              {
                "href": "/catalogo?q=Sin%20alcohol",
                "label": "Sin alcohol"
              }
            ]
          },
          {
            "title": "HILO DENTAL",
            "href": "/catalogo?q=HILO%20DENTAL",
            "links": [
              {
                "href": "/catalogo?q=HILO%20DENTAL",
                "label": "HILO DENTAL"
              },
              {
                "href": "/catalogo?q=Menta",
                "label": "Menta"
              },
              {
                "href": "/catalogo?q=TOTAL",
                "label": "TOTAL"
              }
            ]
          }
        ]
      },
      {
        "id": "higiene-personal",
        "label": "Higiene Personal",
        "title": "Higiene Personal",
        "columns": [
          {
            "title": "ADULTO MAYOR",
            "href": "/catalogo?q=ADULTO%20MAYOR",
            "links": [
              {
                "href": "/catalogo?q=ADULTO%20MAYOR",
                "label": "ADULTO MAYOR"
              },
              {
                "href": "/catalogo?q=Pa%C3%B1al",
                "label": "Pañal"
              },
              {
                "href": "/catalogo?q=Toallas",
                "label": "Toallas"
              }
            ]
          },
          {
            "title": "CUIDADO PERSONAL",
            "href": "/catalogo?q=CUIDADO%20PERSONAL",
            "links": [
              {
                "href": "/catalogo?q=CUIDADO%20PERSONAL",
                "label": "CUIDADO PERSONAL"
              },
              {
                "href": "/catalogo?q=Desodorante",
                "label": "Desodorante"
              },
              {
                "href": "/catalogo?q=Espuma%20de%20afeitar",
                "label": "Espuma de afeitar"
              },
              {
                "href": "/catalogo?q=Jabones",
                "label": "Jabones"
              },
              {
                "href": "/catalogo?q=Pa%C3%B1uelos",
                "label": "Pañuelos"
              },
              {
                "href": "/catalogo?q=Talco",
                "label": "Talco"
              },
              {
                "href": "/catalogo?q=Toallas%20H%C3%BAmedas",
                "label": "Toallas Húmedas"
              }
            ]
          },
          {
            "title": "HIGIENE FEMENINO",
            "href": "/catalogo?q=HIGIENE%20FEMENINO",
            "links": [
              {
                "href": "/catalogo?q=HIGIENE%20FEMENINO",
                "label": "HIGIENE FEMENINO"
              },
              {
                "href": "/catalogo?q=Tamp%C3%B3n",
                "label": "Tampón"
              },
              {
                "href": "/catalogo?q=Toallas",
                "label": "Toallas"
              }
            ]
          },
          {
            "title": "KITS Y REGALOS",
            "href": "/catalogo?q=KITS%20Y%20REGALOS",
            "links": [
              {
                "href": "/catalogo?q=KITS%20Y%20REGALOS",
                "label": "KITS Y REGALOS"
              },
              {
                "href": "/catalogo?q=Kit%20colonia%20%2B%20regalo",
                "label": "Kit colonia + regalo"
              },
              {
                "href": "/catalogo?q=Kit%20colonias",
                "label": "Kit colonias"
              },
              {
                "href": "/catalogo?q=Kit%20deo%20%2B%20colonia",
                "label": "Kit deo + colonia"
              },
              {
                "href": "/catalogo?q=Kit%20deo%20%2B%20gel",
                "label": "Kit deo + gel"
              },
              {
                "href": "/catalogo?q=Kit%20espuma%20%2B%20deo",
                "label": "Kit espuma + deo"
              },
              {
                "href": "/catalogo?q=Kit%20jabones%20%2B%20cepillo",
                "label": "Kit jabones + cepillo"
              }
            ]
          }
        ]
      },
      {
        "id": "infantil",
        "label": "Cuidado Infantil",
        "title": "Infantil",
        "columns": [
          {
            "title": "HIGIENE DENTAL INFANTIL",
            "href": "/catalogo?q=HIGIENE%20DENTAL%20INFANTIL",
            "links": [
              {
                "href": "/catalogo?q=HIGIENE%20DENTAL%20INFANTIL",
                "label": "HIGIENE DENTAL INFANTIL"
              },
              {
                "href": "/catalogo?q=Cepillos",
                "label": "Cepillos"
              },
              {
                "href": "/catalogo?q=Combo%20crem%2Bcep",
                "label": "Combo crem+cep"
              },
              {
                "href": "/catalogo?q=Crema%20dental",
                "label": "Crema dental"
              },
              {
                "href": "/catalogo?q=Enjuagues",
                "label": "Enjuagues"
              }
            ]
          },
          {
            "title": "KITS INFANTILES",
            "href": "/catalogo?q=KITS%20INFANTILES",
            "links": [
              {
                "href": "/catalogo?q=KITS%20INFANTILES",
                "label": "KITS INFANTILES"
              },
              {
                "href": "/catalogo?q=Full%20kit%20kids%204-1",
                "label": "Full kit kids 4-1"
              },
              {
                "href": "/catalogo?q=Kit%20kids%20colonia%2Bshampoo",
                "label": "Kit kids colonia+shampoo"
              }
            ]
          },
          {
            "title": "CUIDADO BEBÉS",
            "href": "/catalogo?q=CUIDADO%20BEB%C3%89S",
            "links": [
              {
                "href": "/catalogo?q=CUIDADO%20BEB%C3%89S",
                "label": "CUIDADO BEBÉS"
              },
              {
                "href": "/catalogo?q=Pa%C3%B1ales",
                "label": "Pañales"
              },
              {
                "href": "/catalogo?q=Toallas%20h%C3%BAmedas%20kids",
                "label": "Toallas húmedas kids"
              },
              {
                "href": "/catalogo?q=Implementos",
                "label": "Implementos"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "hogar",
    "name": "HOGAR Y UTILIDADES",
    "href": "categoria-hogar.html",
    "groups": [
      {
        "id": "electronicos",
        "label": "Accesorios Electrónicos",
        "title": "Accesorios Electrónicos",
        "columns": [
          {
            "title": "ENERGÍA",
            "href": "/catalogo?q=ENERG%C3%8DA",
            "links": [
              {
                "href": "/catalogo?q=ENERG%C3%8DA",
                "label": "ENERGÍA"
              },
              {
                "href": "/catalogo?q=Pilas%20y%20Bater%C3%ADas",
                "label": "Pilas y Baterías"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "limpieza",
    "name": "LIMPIEZA DEL HOGAR",
    "href": "categoria-limpieza.html",
    "groups": [
      {
        "id": "accesorios-limpieza",
        "label": "Accesorios de Limpieza",
        "title": "Accesorios de Limpieza",
        "columns": [
          {
            "title": "ESCOBAS Y MOPAS",
            "href": "/catalogo?q=ESCOBAS%20Y%20MOPAS",
            "links": [
              {
                "href": "/catalogo?q=ESCOBAS%20Y%20MOPAS",
                "label": "ESCOBAS Y MOPAS"
              },
              {
                "href": "/catalogo?q=Escobas%20Interiores",
                "label": "Escobas Interiores"
              },
              {
                "href": "/catalogo?q=Mopas%20Algod%C3%B3n",
                "label": "Mopas Algodón"
              },
              {
                "href": "/catalogo?q=Rodillos%20Quita%20pelusa",
                "label": "Rodillos Quita pelusa"
              }
            ]
          },
          {
            "title": "ESPONJAS Y FIBRAS",
            "href": "/catalogo?q=ESPONJAS%20Y%20FIBRAS",
            "links": [
              {
                "href": "/catalogo?q=ESPONJAS%20Y%20FIBRAS",
                "label": "ESPONJAS Y FIBRAS"
              },
              {
                "href": "/catalogo?q=Especializada",
                "label": "Especializada"
              },
              {
                "href": "/catalogo?q=Fibra",
                "label": "Fibra"
              },
              {
                "href": "/catalogo?q=Fibra%20Esponja",
                "label": "Fibra Esponja"
              }
            ]
          },
          {
            "title": "GUANTES",
            "href": "/catalogo?q=GUANTES",
            "links": [
              {
                "href": "/catalogo?q=GUANTES",
                "label": "GUANTES"
              },
              {
                "href": "/catalogo?q=Cocina",
                "label": "Cocina"
              },
              {
                "href": "/catalogo?q=Lavander%C3%ADa",
                "label": "Lavandería"
              },
              {
                "href": "/catalogo?q=Multiusos",
                "label": "Multiusos"
              },
              {
                "href": "/catalogo?q=Trabajo%20Pesado",
                "label": "Trabajo Pesado"
              }
            ]
          },
          {
            "title": "PAÑOS",
            "href": "/catalogo?q=PA%C3%91OS",
            "links": [
              {
                "href": "/catalogo?q=PA%C3%91OS",
                "label": "PAÑOS"
              },
              {
                "href": "/catalogo?q=Absorbentes",
                "label": "Absorbentes"
              },
              {
                "href": "/catalogo?q=Antibacterial",
                "label": "Antibacterial"
              },
              {
                "href": "/catalogo?q=Microfibra",
                "label": "Microfibra"
              },
              {
                "href": "/catalogo?q=Multi-Usos",
                "label": "Multi-Usos"
              },
              {
                "href": "/catalogo?q=Reutilizable",
                "label": "Reutilizable"
              },
              {
                "href": "/catalogo?q=Secatodo",
                "label": "Secatodo"
              }
            ]
          }
        ]
      },
      {
        "id": "cuidado-ropa",
        "label": "Limpieza y cuidado de la ropa",
        "title": "Cuidado de la ropa",
        "columns": [
          {
            "title": "DETERGENTES Y JABONES",
            "href": "/catalogo?q=DETERGENTES%20Y%20JABONES",
            "links": [
              {
                "href": "/catalogo?q=DETERGENTES%20Y%20JABONES",
                "label": "DETERGENTES Y JABONES"
              },
              {
                "href": "/catalogo?q=L%C3%ADquido",
                "label": "Líquido"
              },
              {
                "href": "/catalogo?q=Polvo",
                "label": "Polvo"
              },
              {
                "href": "/catalogo?q=Jab%C3%B3n%20en%20Barra",
                "label": "Jabón en Barra"
              }
            ]
          },
          {
            "title": "QUITAMANCHAS Y SUAVIZANTES",
            "href": "/catalogo?q=QUITAMANCHAS%20Y%20SUAVIZANTES",
            "links": [
              {
                "href": "/catalogo?q=QUITAMANCHAS%20Y%20SUAVIZANTES",
                "label": "QUITAMANCHAS Y SUAVIZANTES"
              },
              {
                "href": "/catalogo?q=Quitamanchas%20Gel",
                "label": "Quitamanchas Gel"
              },
              {
                "href": "/catalogo?q=Quitamanchas%20L%C3%ADquido",
                "label": "Quitamanchas Líquido"
              },
              {
                "href": "/catalogo?q=Quitamanchas%20Polvo",
                "label": "Quitamanchas Polvo"
              },
              {
                "href": "/catalogo?q=Suavizante%20L%C3%ADquido",
                "label": "Suavizante Líquido"
              }
            ]
          }
        ]
      },
      {
        "id": "limpieza-general",
        "label": "Limpieza General",
        "title": "Limpieza General",
        "columns": [
          {
            "title": "AROMATIZANTES E INSECTICIDAS",
            "href": "/catalogo?q=AROMATIZANTES%20E%20INSECTICIDAS",
            "links": [
              {
                "href": "/catalogo?q=AROMATIZANTES%20E%20INSECTICIDAS",
                "label": "AROMATIZANTES E INSECTICIDAS"
              },
              {
                "href": "/catalogo?q=Aerosol%20%28Aroma%29",
                "label": "Aerosol (Aroma)"
              },
              {
                "href": "/catalogo?q=Insecticida%20Aerosol",
                "label": "Insecticida Aerosol"
              },
              {
                "href": "/catalogo?q=Insecticida%20Zancudos",
                "label": "Insecticida Zancudos"
              }
            ]
          },
          {
            "title": "CERAS Y LUSTRAMUEBLES",
            "href": "/catalogo?q=CERAS%20Y%20LUSTRAMUEBLES",
            "links": [
              {
                "href": "/catalogo?q=CERAS%20Y%20LUSTRAMUEBLES",
                "label": "CERAS Y LUSTRAMUEBLES"
              },
              {
                "href": "/catalogo?q=Autobrillante",
                "label": "Autobrillante"
              },
              {
                "href": "/catalogo?q=Pasta",
                "label": "Pasta"
              },
              {
                "href": "/catalogo?q=Lustramueble",
                "label": "Lustramueble"
              }
            ]
          },
          {
            "title": "DESINFECTANTES Y LEJÍAS",
            "href": "/catalogo?q=DESINFECTANTES%20Y%20LEJ%C3%8DAS",
            "links": [
              {
                "href": "/catalogo?q=DESINFECTANTES%20Y%20LEJ%C3%8DAS",
                "label": "DESINFECTANTES Y LEJÍAS"
              },
              {
                "href": "/catalogo?q=Desinfectantes",
                "label": "Desinfectantes"
              },
              {
                "href": "/catalogo?q=Limpiador",
                "label": "Limpiador"
              },
              {
                "href": "/catalogo?q=Lej%C3%ADas",
                "label": "Lejías"
              },
              {
                "href": "/catalogo?q=Qu%C3%ADmicos",
                "label": "Químicos"
              }
            ]
          },
          {
            "title": "LAVAVAJILLAS",
            "href": "/catalogo?q=LAVAVAJILLAS",
            "links": [
              {
                "href": "/catalogo?q=LAVAVAJILLAS",
                "label": "LAVAVAJILLAS"
              },
              {
                "href": "/catalogo?q=L%C3%ADquido",
                "label": "Líquido"
              },
              {
                "href": "/catalogo?q=Pasta",
                "label": "Pasta"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "papeleria",
    "name": "PAPELERÍA",
    "href": "categoria-papeleria.html",
    "groups": [
      {
        "id": "papeleria-hogar",
        "label": "Papelería del Hogar",
        "title": "Papelería del Hogar",
        "columns": [
          {
            "title": "PAPEL HIGIÉNICO",
            "href": "/catalogo?q=PAPEL%20HIGI%C3%89NICO",
            "links": [
              {
                "href": "/catalogo?q=PAPEL%20HIGI%C3%89NICO",
                "label": "PAPEL HIGIÉNICO"
              },
              {
                "href": "/catalogo?q=Doble%20hoja",
                "label": "Doble hoja"
              },
              {
                "href": "/catalogo?q=Industrial",
                "label": "Industrial"
              },
              {
                "href": "/catalogo?q=Liso",
                "label": "Liso"
              },
              {
                "href": "/catalogo?q=Triple%20Hoja",
                "label": "Triple Hoja"
              }
            ]
          },
          {
            "title": "PAPEL TOALLA",
            "href": "/catalogo?q=PAPEL%20TOALLA",
            "links": [
              {
                "href": "/catalogo?q=PAPEL%20TOALLA",
                "label": "PAPEL TOALLA"
              },
              {
                "href": "/catalogo?q=Descartable",
                "label": "Descartable"
              },
              {
                "href": "/catalogo?q=Multiusos",
                "label": "Multiusos"
              },
              {
                "href": "/catalogo?q=Rollazo",
                "label": "Rollazo"
              }
            ]
          },
          {
            "title": "SERVILLETAS",
            "href": "/catalogo?q=SERVILLETAS",
            "links": [
              {
                "href": "/catalogo?q=SERVILLETAS",
                "label": "SERVILLETAS"
              },
              {
                "href": "/catalogo?q=Cortada",
                "label": "Cortada"
              },
              {
                "href": "/catalogo?q=Doblada",
                "label": "Doblada"
              }
            ]
          }
        ]
      },
      {
        "id": "papeleria-institucional",
        "label": "Papelería Institucional",
        "title": "Papelería Institucional",
        "columns": [
          {
            "title": "INDUSTRIAL",
            "href": "/catalogo?q=INDUSTRIAL",
            "links": [
              {
                "href": "/catalogo?q=INDUSTRIAL",
                "label": "INDUSTRIAL"
              },
              {
                "href": "/catalogo?q=Papel%20toalla%20industrial",
                "label": "Papel toalla industrial"
              },
              {
                "href": "/catalogo?q=Servilleta%20industrial",
                "label": "Servilleta industrial"
              }
            ]
          }
        ]
      }
    ]
  }
];
