import Image from "next/image"

export function HouseImage() {
  return (
    <Image
      src="/house.jpg"
      alt="House preview"
      width={80}
      height={80}
      className="object-cover rounded-md"
    />
  )
} 