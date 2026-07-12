export const METRICS = {
  COST: "cost",
  VALUE: "value",
  OZ: "oz",
  GRAMS: "grams",
  KG: "kg",
};


/**
 * Unified portfolio metric engine
 *
 * COST
 *   Purchase cost
 *
 * VALUE
 *   Current market value using spot prices
 *
 * OZ / GRAMS / KG
 *   Physical metal quantities
 *
 * Uses normalized product weights:
 *   products.weight_oz
 *   products.weight_grams
 *   products.weight_kg
 */
export function getItemMetricValue(
  item,
  metric,
  spotPrices
) {

  const quantity =
    Number(item.quantity || 1);


  const product =
    item.product || item;


  const cost =
    Number(item.total_cost || 0);



  const weightOz =
    Number(product.weight_oz || 0) *
    quantity;


  const weightGrams =
    Number(product.weight_grams || 0) *
    quantity;


  const weightKg =
    Number(product.weight_kg || 0) *
    quantity;



  switch(metric) {


    case METRICS.COST:

      return cost;



    case METRICS.VALUE: {

      const metal =
        product.metal?.toLowerCase();


      const price =
        Number(
          spotPrices?.[metal]?.price || 0
        );


      return weightOz * price;

    }



    case METRICS.OZ:

      return weightOz;



    case METRICS.GRAMS:

      return weightGrams;



    case METRICS.KG:

      return weightKg;



    default:

      return cost;

  }

}