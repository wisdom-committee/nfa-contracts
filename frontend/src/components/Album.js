import { Card, List } from "antd";

const Album = ({ size, stickers }) => {
  console.log(stickers)

  const cards = Array.from({length: size}, (_, index) => {
    const position = index + 1
    const current = stickers.find(i => i.position === position)
  
    console.log(current)

    if (current) {
      return ({
        position,
        image: current.image
      })
    }

    return ({
      position,
      name: 'unknown',
      description: 'n/a',
      image: './emptyCard.jpg'
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
        const id = item.position;
        return (
          <List.Item key={id}>
            <Card
              title={
                <div>
                  <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
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
