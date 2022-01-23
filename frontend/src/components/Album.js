import { Card, List } from "antd";

const Album = ({ size, stickers }) => {
  console.log("stickers", stickers)

  const cards = Array.from({ length: size }, (_, id) => {
    const current = stickers[id]

    console.log(current)

    return ({
      id,
      image: current.balance > 0 ? current.image : './emptyCard.jpg',
      balance: current.balance,
    })
  })

  console.log(cards)

  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 4,
        lg: 4,
        xl: 6,
        xxl: 3,
      }}
      dataSource={cards}
      renderItem={item => {
        return (
          <List.Item key={item.id}>
            <Card
              title={
                <div>
                  <span style={{ fontSize: 16, marginRight: 8 }}>Bored Ape #{item.id} ({item.balance})</span>
                </div>
              }
            >
              <div>
                <img src={item.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} style={{ maxWidth: 150 }} />
              </div>
              <div>{item.description}</div>
            </Card>
          </List.Item>
        );
      }}
    />
  );
}
export { Album }
