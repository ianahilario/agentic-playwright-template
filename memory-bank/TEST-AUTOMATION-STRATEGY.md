# Test automation strategy

## What the application under test is

[Swag Labs](https://www.saucedemo.com/) is the online store for Sauce Labs merchandise. It sells the company's own merch such as but not limited to a backpack, a bike light, shirts, a fleece jacket, and an onesie. A shopper signs in, looks through that catalog, puts items in a cart, and pays for an order.

## Business risks

| Level | Impact          | Risk item                                             | What can go wrong                                                                                                                                                              |
| ----- | --------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Financial       | Wrong total                                           | The store quotes one item price, tax, or total and charges another on the SauceCard.                                                                                           |
| 1     | Financial       | Order confirmed with items still in the cart          | The shopper is told the purchase finished while the cart still holds the goods.                                                                                                |
| 1     | Financial       | Cancelled checkout still completes                    | Payment is taken for a sale the shopper backed out of.                                                                                                                         |
| 1     | Financial       | Locked account can sign in                            | A blocked customer can still buy.                                                                                                                                              |
| 1     | Reputational    | Broken product photo                                  | Shoppers will not pay for an item they cannot see, and the shop looks careless.                                                                                                |
| 1     | Reputational    | Error while removing an item                          | The store looks unable to finish a basic cart change.                                                                                                                          |
| 1     | Legal           | Cancelled order still confirmed                       | The store's record says a sale happened after the shopper cancelled.                                                                                                           |
| 1     | Legal           | Charge differs from the overview                      | The amount taken is not the amount the shopper was shown before paying.                                                                                                        |
| 1     | Legal           | Blocked customer completes a purchase                 | A person the store had blocked still receives an order.                                                                                                                        |
| 2     | User experience | Sign-in blocked with no clear reason                  | The shopper never reaches the store and cannot tell why.                                                                                                                       |
| 2     | User experience | Login messages mixed together                         | A blank field, a password that does not match, and a locked account are different failures. One message for all three leaves the person guessing.                              |
| 2     | User experience | Product hard to find                                  | The list, a sort change, or the product page fails, so the shopper cannot choose.                                                                                              |
| 2     | User experience | Cart count does not match                             | The count shows a different number than the items added.                                                                                                                       |
| 2     | User experience | Remove does not clear the cart                        | The item stays after the shopper takes it out.                                                                                                                                 |
| 2     | User experience | Checkout continues with a missing name or postal code | An incomplete order is allowed through.                                                                                                                                        |
| 2     | User experience | Leaving checkout places the order                     | Backing out still completes the purchase.                                                                                                                                      |
| 2     | User experience | Cart count and the open page disagree                 | The count drops while the page still looks full, so the shopper distrusts the cart.                                                                                            |
| 2     | User experience | Spinner never finishes                                | The catalog looks like it is loading and the products never appear.                                                                                                            |
| 2     | User experience | Long list never reveals more rows                     | Extra products, including sizes, stay hidden.                                                                                                                                  |
| 2     | User experience | Slider will not change the product                    | The shopper is stuck on one item.                                                                                                                                              |
| 3     | Scalability     | Catalog loads in pieces                               | Extra products and sizes appear only as the shopper moves down the list. When those rows never arrive, the browse becomes a lost sale, and it gets worse as the catalog grows. |
| 3     | Scalability     | Catalog waits behind a spinner                        | Products stay hidden while the page loads. Slow responses turn that wait into a lost sale.                                                                                     |

## Test Automation Goal

The goal is an automated regression suite for Swag Labs.

- It protects the store from regressions on the defined business risks above.
- It eliminates the effort for manual regression tests so that a human can spend more time on exploratory testing, looking for problems the suite does not already cover.
- It gives fast feedback on a deploy. The suite must run when a change is deployed and therefore we'll be alerted as early as possible if a failed test is due to a regression.
