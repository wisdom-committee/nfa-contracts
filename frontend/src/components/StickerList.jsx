import { Card, List } from 'antd'

const StickerList = ({ stickers, transactionHash }) => {
  return (
    <List
      header={`Last transaction hash ${transactionHash}`}
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 4,
        lg: 4,
        xl: 6,
        xxl: 3
      }}
      dataSource={stickers}
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
                <img src={item.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} style={{ maxWidth: 150 }} alt='' />
              </div>
              <div>{item.description}</div>
            </Card>
          </List.Item>
        )
      }}
    />
  )
}
export { StickerList }
